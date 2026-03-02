import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client for server-side uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const productId = data.get("productId") as string;

        if (!file || !productId) {
            return NextResponse.json({ success: false, error: "File and productId are required." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${productId}-${Date.now()}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            return NextResponse.json({ success: false, error: "Upload failed: " + uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

        return NextResponse.json({ success: true, imageUrl: publicUrlData.publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
