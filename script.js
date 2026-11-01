// Versão reduzida: seleção de serviço e resumo simples, sem chatbot e sem API.
const formulario = document.getElementById('formulario');
const campoServico = document.getElementById('servico');
const resultado = document.getElementById('resultado');

document.querySelectorAll('[data-servico]').forEach(function (botao) {
  botao.addEventListener('click', function () {
    campoServico.value = botao.dataset.servico;
    document.getElementById('contato').scrollIntoView();
  });
});

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const dados = new FormData(formulario);
  resultado.textContent =
    'Resumo de demonstração — ainda não enviado.\n\n' +
    'Nome: ' +
    dados.get('nome') +
    '\n' +
    'Serviço: ' +
    dados.get('servico') +
    '\n' +
    'Descrição: ' +
    dados.get('descricao');
});

// Menu móvel: usado quando o CSS completo for adicionado.
const menu = document.getElementById('menu-toggle');
if (menu) {
  menu.addEventListener('click', function () {
    const aberto = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(aberto));
    menu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    document.getElementById('navegacao').classList.toggle('aberto', aberto);
  });
  document.querySelectorAll('#navegacao a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Abrir menu');
      document.getElementById('navegacao').classList.remove('aberto');
    });
  });
}
