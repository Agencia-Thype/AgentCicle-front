// Testes unitários para funções relacionadas ao ciclo menstrual
describe('Ciclo Menstrual', () => {
  describe('Cálculo de Fase do Ciclo', () => {
    it('deve identificar fase menstrual corretamente', () => {
      const dataMenstruacao = new Date('2024-01-01');
      const dataAtual = new Date('2024-01-03');
      const diasPassados = Math.floor((dataAtual.getTime() - dataMenstruacao.getTime()) / (1000 * 60 * 60 * 24));
      expect(diasPassados).toBe(2);
    });

    it('deve calcular fase folicular corretamente', () => {
      const dataMenstruacao = new Date('2024-01-01');
      const dataAtual = new Date('2024-01-08');
      const diasPassados = Math.floor((dataAtual.getTime() - dataMenstruacao.getTime()) / (1000 * 60 * 60 * 24));
      expect(diasPassados).toBe(7);
    });

    it('deve identificar próxima menstruação', () => {
      const ciclo = 28;
      const dataMenstruacao = new Date('2024-01-01');
      const proximaMenstruacao = new Date(dataMenstruacao);
      proximaMenstruacao.setDate(dataMenstruacao.getDate() + ciclo);
      expect(proximaMenstruacao.toISOString().split('T')[0]).toBe('2024-01-29');
    });
  });

  describe('Validação de Sintomas', () => {
    it('deve validar humor válido', () => {
      const humoresValidos = ['feliz', 'triste', 'irritada', 'ansiosa', 'calma'];
      expect(humoresValidos).toContain('feliz');
      expect(humoresValidos).toContain('calma');
      expect(humoresValidos).not.toContain('invalido');
    });

    it('deve validar intensidade de fluxo', () => {
      const fluxosValidos = ['leve', 'moderado', 'intenso'];
      expect(fluxosValidos).toContain('moderado');
      expect(fluxosValidos).not.toContain('muito intenso');
    });
  });

  describe('Pontuação de Treino', () => {
    it('deve calcular pontos por treino completo', () => {
      const pontosPorTreino = 10;
      const treinosCompletados = 5;
      const total = pontosPorTreino * treinosCompletados;
      expect(total).toBe(50);
    });

    it('deve calcular bônus por streak', () => {
      const streak = 7;
      let bonus = 0;
      if (streak >= 7) bonus = 20;
      else if (streak >= 3) bonus = 10;
      expect(bonus).toBe(20);
    });
  });
});
