// Testes unitários simples de funções utilitárias
describe('Funções Utilitárias', () => {
  describe('Formatação de Data', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date(Date.UTC(2024, 0, 15));
      const formatted = date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      expect(formatted).toBe('15/01/2024');
    });

    it('deve calcular dias restantes corretamente', () => {
      const hoje = new Date('2024-01-10');
      const fimTrial = new Date('2024-01-17');
      const diffTime = fimTrial.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });
  });

  describe('Validação de Email', () => {
    it('deve validar email corretamente', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
    });
  });

  describe('Formatação de Telefone', () => {
    it('deve formatar telefone brasileiro', () => {
      const phone = '11987654321';
      const formatted = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      expect(formatted).toBe('(11) 98765-4321');
    });
  });

  describe('Cálculo de IMC', () => {
    it('deve calcular IMC corretamente', () => {
      const peso = 70;
      const altura = 1.75;
      const imc = peso / (altura * altura);
      expect(imc).toBeCloseTo(22.86, 2);
    });

    it('deve classificar IMC corretamente', () => {
      const imc = 22.86;
      let classificacao = '';
      if (imc < 18.5) classificacao = 'Abaixo do peso';
      else if (imc < 25) classificacao = 'Peso normal';
      else if (imc < 30) classificacao = 'Sobrepeso';
      else classificacao = 'Obesidade';
      expect(classificacao).toBe('Peso normal');
    });
  });
});
