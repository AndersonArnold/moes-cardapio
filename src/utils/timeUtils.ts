export function calculateIsOpen(
    operatingDays: string,
    openingTime: string,
    closingTime: string
): boolean {
    const now = new Date();

    // Obter data e hora em SP (Brasil)
    const spOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };

    const spDateStr = new Intl.DateTimeFormat('pt-BR', spOptions).format(now);
    // Exemplo do formato em pt-BR: "segunda-feira, 18:45"
    const [weekdayStr, timeStr] = spDateStr.split(', ');

    // Lógica simples para os dias:
    // Padrão solicitado: Terça a Domingo
    if (operatingDays.toLowerCase().includes('terça a domingo')) {
        const day = weekdayStr.toLowerCase().trim();
        if (day === 'segunda-feira' || day === 'segunda') {
            return false;
        }
    }

    const currentMinutes = timeToMinutes(timeStr);
    const openingMinutes = timeToMinutes(openingTime);
    let closingMinutes = timeToMinutes(closingTime);

    // Se a hora de fechamento é no dia seguinte (ex: abre 18:30, fecha 02:00)
    if (closingMinutes < openingMinutes) {
        closingMinutes += 24 * 60;
    }

    let checkMinutes = currentMinutes;
    // Se a hora atual é de madrugada (passou da meia-noite), adicionar 24 horas 
    // para compararmos corretamente na janela de abertura.
    if (currentMinutes < openingMinutes && currentMinutes < 12 * 60) {
        checkMinutes += 24 * 60;
    }

    return checkMinutes >= openingMinutes && checkMinutes <= closingMinutes;
}

function timeToMinutes(time: string): number {
    if (!time || !time.includes(':')) return 0;
    const [h, m] = time.split(':').map(Number);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}
