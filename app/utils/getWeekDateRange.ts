export function getWeekDateRange(): { inicio: string; fim: string } {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda...
  
    // Ajusta para segunda-feira da semana atual
    const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    const segunda = new Date(hoje.setDate(diffSegunda));
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
  
    const formatar = (data: Date) => data.toISOString().split("T")[0];
  
    return {
      inicio: formatar(segunda),
      fim: formatar(domingo),
    };
  }
  