const telas = {
  inicio: {
    src: "/img/tela-inicio.png",
    alt: "Tela inicial do Cíclica na fase lútea, com treino, Kegel, rotina e progresso da semana",
    texto: "A home abre na fase de hoje. Lútea, sensível, com o dia do ciclo, o treino, o Kegel, a rotina, o progresso da semana e os pontos.",
  },
  ciclo: {
    src: "/img/tela-ciclo.png",
    alt: "Calendário do ciclo no Cíclica, com menstruação, período fértil, ovulação e previsão",
    texto: "O calendário marca menstruação, período fértil, ovulação e a previsão. No topo, a fase atual e quantos dias faltam para a próxima menstruação.",
  },
  treino: {
    src: "/img/tela-treino.png",
    alt: "Treino da fase lútea no Cíclica, com a lista de exercícios do dia",
    texto: "O treino nasce da fase. Na lútea, o Treino D mostra duração, foco e nível, e cada exercício traz séries, repetições, descanso e uma dica.",
  },
  timer: {
    src: "/img/tela-timer.png",
    alt: "Cronômetro do exercício Abdominal Infra, com tempo restante e dica de execução",
    texto: "Durante o exercício, o anel conta o tempo restante. Dá para pausar, anotar, ir para o próximo ou encerrar. A faixa de baixo lembra: disciplina hoje, resultados sempre.",
  },
  kegel: {
    src: "/img/tela-kegel.png",
    alt: "Tela de Kegel no nível iniciante, com exercícios de resistência, agilidade e hipertrofia",
    texto: "Três níveis: iniciante, intermediário e avançado. Cada exercício mostra o objetivo, as séries, o descanso e o que já foi concluído.",
  },
  guia: {
    src: "/img/tela-kegel-lunia.jpg",
    alt: "Lunia guiando um exercício de Kegel, com o tempo e a instrução de contrair mais forte",
    texto: "No meio da série, a Lunia ocupa o centro. Ela muda de expressão conforme o movimento e pede para contrair um pouco mais, no ritmo dela.",
  },
  rotina: {
    src: "/img/tela-rotina.png",
    alt: "Tela Minha rotina, com hidratação do dia e o convite para cadastrar suplementos",
    texto: "A rotina guarda suplementos, vitaminas e remédios. A hidratação do dia aparece em mililitros, com meta de 2,1 L e atalhos de 200, 300 e 500 ml.",
  },
  item: {
    src: "/img/tela-rotina-item.png",
    alt: "Formulário para adicionar suplemento, medicamento ou vitamina à rotina",
    texto: "Cada item tem nome, categoria, dosagem, frequência, horários e dias da semana. Dá para marcar se foi indicado por um médico e ligar o lembrete.",
  },
  perfil: {
    src: "/img/tela-perfil.png",
    alt: "Perfil do Cíclica com altura, peso, objetivo, duração do ciclo e IMC",
    texto: "O perfil pede altura, peso, objetivo, duração do ciclo e a data da última menstruação. O IMC é calculado a partir da altura e do peso.",
  },
  lunia: {
    src: "/img/tela-lunia.jpg",
    alt: "Conversa com a Lunia sobre a fase ovulatória e o treino que combina com o dia",
    texto: "A Lunia lê a fase e responde no chat. Os atalhos perguntam o treino ideal, como está o humor e o que evitar naquele momento.",
  },
};

const textoTela = document.querySelector("#tela-texto");
const fotoTela = document.querySelector("#tela-ativa");

document.querySelectorAll(".miniatura").forEach((botao) => {
  botao.addEventListener("click", () => {
    const tela = telas[botao.dataset.tela];
    if (!tela || !fotoTela) return;
    document.querySelectorAll(".miniatura").forEach((item) => {
      item.setAttribute("aria-selected", "false");
    });
    botao.setAttribute("aria-selected", "true");
    fotoTela.src = tela.src;
    fotoTela.alt = tela.alt;
    if (textoTela) textoTela.textContent = tela.texto;
  });
});
const topo = document.querySelector(".topo");
const menu = document.querySelector(".menu");
const botaoMenu = document.querySelector(".botao-menu");

if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
    });
  });
}

const ano = document.querySelector("[data-ano]");
if (ano) ano.textContent = String(new Date().getFullYear());

window.addEventListener("scroll", () => {
  topo?.classList.toggle("rolou", window.scrollY > 8);
}, { passive: true });

document.querySelectorAll(".plano").forEach((plano) => {
  plano.addEventListener("click", () => {
    document.querySelectorAll(".plano").forEach((item) => {
      item.setAttribute("aria-pressed", "false");
    });
    plano.setAttribute("aria-pressed", "true");
  });
});

const aviso = document.querySelector(".aviso-loja");
document.querySelectorAll(".loja").forEach((loja) => {
  loja.addEventListener("click", (evento) => {
    const url = loja.getAttribute("href") || "";
    if (url.startsWith("http")) return;
    evento.preventDefault();
    if (aviso) {
      aviso.textContent = "O link oficial da loja entra aqui na publicação. A compra continua dentro da App Store ou da Google Play.";
    }
  });
});

const secoes = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll(".menu a[href^='#']")];

const marcarSecao = () => {
  let id = "";
  secoes.forEach((secao) => {
    if (secao.offsetTop - 140 <= window.scrollY) id = secao.id;
  });
  links.forEach((link) => {
    link.classList.toggle("ativo", id !== "" && link.getAttribute("href") === `#${id}`);
  });
};

if (secoes.length && links.length) {
  marcarSecao();
  window.addEventListener("scroll", marcarSecao, { passive: true });
}
