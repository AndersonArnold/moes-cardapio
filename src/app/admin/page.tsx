"use client";

import { useState, useRef, useEffect } from "react";
import { useMenuStore, MenuItem } from "../../store/useMenuStore";
import { useStoreConfig } from "../../store/useStoreConfig";
import Image from "next/image";

export default function AdminPage() {
    const { items, categories, updateItemImage, addItem, updateItem, deleteItem, fetchMenu, seedCategories, seedProducts, isLoading, addCategory, updateCategory, deleteCategory, updateCategoryOrder, updateProductOrder } = useMenuStore();
    const config = useStoreConfig();

    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'menu' | 'settings'>('menu');

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");

    // CRUD Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        imageUrl: ""
    });

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchMenu();
        config.fetchConfig();
    }, [fetchMenu, config.fetchConfig]);

    useEffect(() => {
        if (categories.length > 0 && !formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [categories, formData.categoryId]);

    const handleCreateClick = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            price: 0,
            categoryId: categories[0]?.id || "",
            imageUrl: ""
        });
        setUploadError("");
        setIsModalOpen(true);
    };

    const handleEditClick = (product: MenuItem) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl
        });
        setUploadError("");
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            deleteItem(id);
        }
    };

    const handleSaveProduct = () => {
        if (!formData.name || !formData.categoryId || formData.price === undefined) {
            alert("Preencha todos os campos obrigatórios (Nome, Categoria, Preço).");
            return;
        }

        const numericPrice = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;

        if (editingId) {
            updateItem(editingId, { ...formData, price: numericPrice });
        } else {
            addItem({
                name: formData.name,
                description: formData.description || "",
                price: numericPrice,
                categoryId: formData.categoryId,
                imageUrl: formData.imageUrl
            } as any);
        }
        setIsModalOpen(false);
    };

    const handleFileUpload = async (file: File, id: string, isLogo = false) => {
        setIsUploading(true);
        setUploadError("");

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("productId", id || `temp-${Date.now()}`);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            const data = await res.json();

            if (data.success) {
                if (isLogo) {
                    config.updateConfig({ logoUrl: data.imageUrl });
                } else {
                    setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
                    if (id) {
                        updateItemImage(id, data.imageUrl);
                    }
                }
            } else {
                setUploadError(data.error || "Erro ao fazer upload da imagem.");
            }
        } catch (error) {
            setUploadError("Erro no servidor ao enviar a imagem.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, editingId || "", false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, "store-logo", true);
        }
    };

    const moveCategoryUp = (index: number) => {
        if (index === 0) return;
        const newCategories = [...categories];
        [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
        updateCategoryOrder(newCategories);
    };

    const moveCategoryDown = (index: number) => {
        if (index === categories.length - 1) return;
        const newCategories = [...categories];
        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
        updateCategoryOrder(newCategories);
    };

    const moveProductUp = (categoryItems: any[], index: number) => {
        if (index === 0) return;
        const newOrder = [...categoryItems];
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        updateProductOrder(newOrder);
    };

    const moveProductDown = (categoryItems: any[], index: number) => {
        if (index === categoryItems.length - 1) return;
        const newOrder = [...categoryItems];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        updateProductOrder(newOrder);
    };

    const handleCreateCategory = () => {
        setEditingCategoryId(null);
        setCategoryName("");
        setIsCategoryModalOpen(true);
    };

    const handleEditCategoryClick = (category: any) => {
        setEditingCategoryId(category.id);
        setCategoryName(category.name);
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = () => {
        if (!categoryName.trim()) {
            alert("Preencha o nome da categoria.");
            return;
        }
        if (editingCategoryId) {
            updateCategory(editingCategoryId, { name: categoryName.trim() });
        } else {
            addCategory({ name: categoryName.trim() });
        }
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategoryClick = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir "${name}"? Os produtos associados a ela também não serão exibidos.`)) {
            deleteCategory(id);
        }
    };

    if (!isMounted) return <div className="p-10 font-sans">Carregando painel admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-zinc-900 font-sans font-medium px-6 py-12">
            <div className="max-w-6xl mx-auto">

                <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-orange-600 mb-2">Painel Admin</h1>
                        <p className="text-zinc-500">Gerenciador da Loja e Cardápio</p>
                    </div>
                    <a href="/" className="text-sm font-bold bg-white px-4 py-2 border border-gray-200 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors shadow-sm">
                        Voltar para Loja
                    </a>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'menu' ? 'bg-zinc-900 text-white shadow-md' : 'bg-white text-zinc-500 border border-gray-200 hover:bg-gray-100'}`}
                    >
                        Cardápio e Fotos
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-zinc-900 text-white shadow-md' : 'bg-white text-zinc-500 border border-gray-200 hover:bg-gray-100'}`}
                    >
                        Configurações da Loja
                    </button>
                </div>

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                    <div className="space-y-12 animate-fade-in">

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900">Seus Itens</h2>
                                <p className="text-sm text-zinc-500">Adicione, edite ou remova lanches do seu cardápio</p>
                            </div>
                            <div className="flex gap-3">
                                {categories.length === 0 && (
                                    <button
                                        onClick={() => seedCategories()}
                                        disabled={isLoading}
                                        className="bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-900 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                                    >
                                        {isLoading ? 'Cadastrando...' : 'Cadastrar Categorias Iniciais'}
                                    </button>
                                )}
                                {categories.length > 0 && items.length === 0 && (
                                    <button
                                        onClick={() => seedProducts()}
                                        disabled={isLoading}
                                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                                    >
                                        {isLoading ? 'Importando...' : 'Importar Cardápio Padrão'}
                                    </button>
                                )}
                                <button
                                    onClick={handleCreateCategory}
                                    className="bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-900 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    + Nova Categoria
                                </button>
                                <button
                                    onClick={handleCreateClick}
                                    disabled={categories.length === 0}
                                    className="bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={categories.length === 0 ? "Cadastre categorias primeiro" : ""}
                                >
                                    + Novo Produto
                                </button>
                            </div>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl border-dashed">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-zinc-300 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                <h3 className="text-xl font-bold text-zinc-800 mb-2">Nenhuma categoria encontrada</h3>
                                <p className="text-zinc-500 mb-6">Para cadastrar produtos, seu banco precisa de categorias.</p>
                                <button
                                    onClick={() => seedCategories()}
                                    disabled={isLoading}
                                    className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    Gerar Categorias Automaticamente
                                </button>
                            </div>
                        ) : (
                            categories.map((category, catIndex) => {
                                const categoryItems = items.filter(item => item.categoryId === category.id);

                                const categoryHeader = (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                        <h2 className="text-2xl font-bold border-l-4 border-orange-500 pl-4">{category.name}</h2>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm sm:ml-auto w-fit">
                                            <button onClick={() => moveCategoryUp(catIndex)} disabled={catIndex === 0} className={`p-1.5 rounded-md transition-colors ${catIndex === 0 ? 'text-gray-300' : 'text-zinc-500 hover:text-orange-600 hover:bg-orange-50'}`} title="Subir Categoria">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
                                            </button>
                                            <button onClick={() => moveCategoryDown(catIndex)} disabled={catIndex === categories.length - 1} className={`p-1.5 rounded-md transition-colors ${catIndex === categories.length - 1 ? 'text-gray-300' : 'text-zinc-500 hover:text-orange-600 hover:bg-orange-50'}`} title="Descer Categoria">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>
                                            </button>
                                            <div className="w-px h-5 bg-gray-200 mx-1"></div>
                                            <button onClick={() => handleEditCategoryClick(category)} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1.5 px-3 text-sm font-bold" title="Editar Nome">
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                                Editar
                                            </button>
                                            <div className="w-px h-5 bg-gray-200 mx-1"></div>
                                            <button onClick={() => handleDeleteCategoryClick(category.id, category.name)} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1.5 px-3 text-sm font-bold" title="Excluir Categoria">
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                );

                                if (categoryItems.length === 0) return (
                                    <div key={category.id}>
                                        {categoryHeader}
                                        <p className="text-zinc-500 text-sm italic mb-6">Nenhum produto cadastrado nesta categoria ainda.</p>
                                    </div>
                                );

                                return (
                                    <div key={category.id}>
                                        {categoryHeader}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {categoryItems.map((item, itemIndex) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full"
                                                >
                                                    {item.imageUrl ? (
                                                        <div className="relative w-full h-40 bg-zinc-100 shrink-0 cursor-pointer" onClick={() => handleEditClick(item)}>
                                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-40 bg-gray-100 shrink-0 flex items-center justify-center text-zinc-400 border-b border-gray-100 cursor-pointer" onClick={() => handleEditClick(item)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50 mb-2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    <div className="p-4 flex flex-col flex-1">
                                                        <div className="flex justify-between items-start gap-2 mb-2">
                                                            <h3 className="font-bold text-sm leading-tight text-zinc-800">{item.name}</h3>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2 mb-2">{item.description}</p>
                                                        <span className="font-black text-xs text-orange-600 mb-2 block">R${item.price.toFixed(2)}</span>

                                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 relative z-10">
                                                            {item.imageUrl ? (
                                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">COM FOTO</span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">SEM FOTO</span>
                                                            )}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex bg-gray-50 border border-gray-200 rounded p-0.5 mr-1">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); moveProductUp(categoryItems, itemIndex); }}
                                                                        disabled={itemIndex === 0}
                                                                        className={`p-1 rounded ${itemIndex === 0 ? 'text-gray-200' : 'text-zinc-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                                                        title="Subir na Categoria"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); moveProductDown(categoryItems, itemIndex); }}
                                                                        disabled={itemIndex === categoryItems.length - 1}
                                                                        className={`p-1 rounded ${itemIndex === categoryItems.length - 1 ? 'text-gray-200' : 'text-zinc-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                                                        title="Descer na Categoria"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                                                    className="text-zinc-400 hover:text-orange-600 transition-colors p-1"
                                                                    title="Editar"
                                                                >
                                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id, item.name); }}
                                                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                                                    title="Excluir"
                                                                >
                                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 animate-fade-in max-w-3xl">
                        <h2 className="text-2xl font-black text-zinc-900 mb-8 border-b border-gray-100 pb-4">Configurações Gerais</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Nome da Loja</label>
                                    <input
                                        type="text"
                                        value={config.storeName}
                                        onChange={(e) => config.updateConfig({ storeName: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">WhatsApp para Pedidos</label>
                                    <input
                                        type="text"
                                        value={config.whatsappNumber}
                                        onChange={(e) => config.updateConfig({ whatsappNumber: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ex: 5511999999999"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-black text-zinc-900 mb-4">Horários e Localização</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Endereço Físico</label>
                                        <input
                                            type="text"
                                            value={config.address}
                                            onChange={(e) => config.updateConfig({ address: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Ex: Rua Exemplo, 123 - Bairro"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Link do Google Maps</label>
                                        <input
                                            type="url"
                                            value={config.googleMapsLink}
                                            onChange={(e) => config.updateConfig({ googleMapsLink: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Ex: https://maps.app.goo.gl/..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Dias de Funcionamento</label>
                                        <input
                                            type="text"
                                            value={config.operatingDays}
                                            onChange={(e) => config.updateConfig({ operatingDays: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Ex: Terça a Domingo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Horário de Abertura</label>
                                        <input
                                            type="time"
                                            value={config.openingTime}
                                            onChange={(e) => config.updateConfig({ openingTime: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Horário de Fechamento</label>
                                        <input
                                            type="time"
                                            value={config.closingTime}
                                            onChange={(e) => config.updateConfig({ closingTime: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Logo da Loja</label>
                                    <div className="flex gap-4 items-center bg-gray-50 border border-gray-200 rounded-xl p-3">
                                        {config.logoUrl ? (
                                            <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                                <Image src={config.logoUrl} alt="Logo" fill className="object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-zinc-400">SEM</div>
                                        )}

                                        <div className="relative flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={logoInputRef}
                                                onChange={handleLogoChange}
                                                disabled={isUploading}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            <button disabled className="w-full bg-white border border-gray-200 text-xs font-bold py-2 rounded shadow-sm hover:border-orange-500 hover:text-orange-600 transition-colors pointer-events-none">
                                                {isUploading ? "Enviando..." : "Substituir Imagem"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Taxa de Entrega (R$)</label>
                                    <input
                                        type="number"
                                        step="0.10"
                                        value={config.deliveryFee}
                                        onChange={(e) => config.updateConfig({ deliveryFee: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                                <div>
                                    <label className="block text-base font-black text-zinc-900 mb-1">Status do Restaurante</label>
                                    <p className="text-xs text-zinc-500 mb-2">Se configurado, sobrepõe os dias e horários automáticos da loja.</p>
                                    <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1">
                                        <button
                                            onClick={() => config.updateConfig({ statusOverride: 'AUTOMATIC' })}
                                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${config.statusOverride === 'AUTOMATIC' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            Automático
                                        </button>
                                        <button
                                            onClick={() => config.updateConfig({ statusOverride: 'FORCE_OPEN' })}
                                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${config.statusOverride === 'FORCE_OPEN' ? 'bg-green-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            Forçar Aberto
                                        </button>
                                        <button
                                            onClick={() => config.updateConfig({ statusOverride: 'FORCE_CLOSED' })}
                                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${config.statusOverride === 'FORCE_CLOSED' ? 'bg-red-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            Forçar Fechado
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>

            {/* General CRUD Editor Modal for Menu Items */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">

                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-zinc-900">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                            <button disabled={isUploading} onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                        </div>

                        <div className="p-6 space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-zinc-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-zinc-700 mb-1">Descrição</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none resize-none h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-1">Preço (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-1">Categoria *</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed text-center">
                                {formData.imageUrl && (
                                    <div className="mb-6 relative w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                                        <Image src={formData.imageUrl} alt="Preview" fill className="object-contain" />
                                    </div>
                                )}

                                <h5 className="font-bold text-zinc-800 mb-1">
                                    {formData.imageUrl ? "Alterar Foto" : "Adicionar Foto"}
                                </h5>
                                <p className="text-xs text-zinc-500 mb-4">Recomendado: 800x800px (1:1), máx 2MB.</p>

                                {uploadError && <div className="mb-4 text-xs font-bold text-white bg-red-500 p-2 rounded">{uploadError}</div>}

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className={`bg-white border border-gray-200 text-zinc-800 font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 ${isUploading ? 'opacity-50' : 'hover:border-orange-500 hover:text-orange-600'}`}>
                                        {isUploading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                                                Selecionar Arquivo
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                disabled={isUploading}
                                onClick={() => setIsModalOpen(false)}
                                className="bg-white border border-gray-200 text-zinc-700 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isUploading}
                                onClick={handleSaveProduct}
                                className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-sm shadow-orange-600/20"
                            >
                                {editingId ? "Salvar Alterações" : "Adicionar Produto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category CRUD Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-zinc-900">{editingCategoryId ? "Editar Categoria" : "Nova Categoria"}</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Nome da Categoria *</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Ex: Bebidas"
                                autoFocus
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="bg-white border border-gray-200 text-zinc-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveCategory}
                                className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
