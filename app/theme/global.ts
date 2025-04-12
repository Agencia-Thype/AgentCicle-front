import { StyleSheet } from 'react-native';

export const themeColors = {
  gradient: [
    '#F3ECE3', // Bege claro
    '#E5D5CF', // Rosado neutro
    '#C8A19C', // Rosé queimado
    '#91766E', // Marrom rosado
    '#6B8F84', // Verde suave
  ] as [string, string, ...string[]],
  button: '#6B8F84', // Verde da asa da mariposa
  buttonText: '#FFFFFF',
  inputBackground: '#F9F5F2',
  inputBorder: '#C8A19C',
  text: '#5C3B3B', // Marrom elegante
  error: '#B00020',
};

export const globalStyles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 150,
    height: 130,
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 24,
  },

  subtitle: {
    fontSize: 16,
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 16,
  },

  input: {
    backgroundColor: '#F3ECE3', // bege elegante
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#5C3B3B', // texto principal marrom
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: themeColors.error,
  },

  button: {
    backgroundColor: themeColors.button,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 8,
  },

  buttonText: {
    color: themeColors.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },

  link: {
    color: '#5C3B3B',
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },

  registerLink: {
    color: '#5C3B3B',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 'bold',
  },

  passwordHint: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
    marginLeft: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
