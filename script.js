'use strict';
const $ = (selector) => document.querySelector(selector);
const normalizar = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
const servicos = [
  {
    nome: 'Reboco de parede',
    re: /reboc|massa|rachadura|parede quebrada|pedreiro/,
    pergunta: 'Qual é a área aproximada da parede, em m²? Se não souber, descreva o tamanho.',
    detalhe:
      'O reboco ajuda a corrigir e dar acabamento à parede. Informe a área e se há umidade ou partes soltas.',
  },
  {
    nome: 'Pintura',
    re: /pint|pintor|pintora/,
    pergunta: 'Quantos cômodos ou quantos m² você quer pintar?',
    detalhe:
      'Podemos organizar um pedido de pintura interna e retoques. A área, o estado da parede e os materiais influenciam na avaliação.',
  },
  {
    nome: 'Troca de lâmpada',
    re: /lampad|luminaria|iluminac/,
    pergunta: 'Quantas lâmpadas ou luminárias precisam de troca? O teto é alto?',
    detalhe:
      'Informe a quantidade, o tipo de lâmpada e a altura de acesso. Isso ajuda a preparar a visita.',
  },
  {
    nome: 'Troca de tomada',
    re: /tomada|interruptor|eletric|choque|curto|fiacao/,
    pergunta: 'Quantas tomadas precisam de troca? Alguma apresenta mau contato?',
    detalhe:
      'A avaliação considera a quantidade de tomadas e as condições da instalação. O serviço elétrico deve ser realizado por profissional qualificado.',
  },
  {
    nome: 'Troca de torneira',
    re: /torneir|vazament|encan|pia|hidraulic|pingando/,
    pergunta: 'É uma torneira de cozinha, banheiro ou outro local? Quantas precisam de troca?',
    detalhe:
      'Informe o local, a quantidade e se existe vazamento. A compatibilidade da peça precisa ser avaliada.',
  },
  {
    nome: 'Montagem de móveis',
    re: /movel|moveis|armario|cama|mesa|guarda.roupa|montag|montar/,
    pergunta: 'Qual móvel precisa de montagem? Quantas peças são?',
    detalhe: 'Informe o tipo e a quantidade de móveis, e se as peças e o manual estão disponíveis.',
  },
  {
    nome: 'Outros serviços',
    re: /outro|desentup|telhad|porta|janel|ar.condicionado|jardim|limpeza/,
    pergunta: 'Descreva o reparo que você precisa, em uma ou duas frases.',
    detalhe: 'Descreva o seu caso. A equipe precisa avaliar se esse atendimento está disponível.',
  },
];
const estadoInicial = () => ({
  servico: '',
  descricao: '',
  quantidade: '',
  bairro: '',
  data: '',
  hora: '',
  preferencia: 'Sem preferência',
  etapa: 'servico',
});
let atendimento = estadoInicial(),
  conversa = [],
  ultimoFoco,
  enviando = false,
  toastTimer,
  pedidoSalvo;
const ler = (store, chave) => {
  try {
    return JSON.parse(store.getItem(chave) || 'null');
  } catch {
    return null;
  }
};
const salvar = (store, chave, dados) => {
  try {
    store.setItem(chave, JSON.stringify(dados));
    return true;
  } catch {
    return false;
  }
};
function toast(texto) {
  $('#toast').textContent = texto;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('#toast').hidden = true), 3500);
}
const menu = $('#menu-toggle');
menu.addEventListener('click', () => {
  const aberto = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(aberto));
  menu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  $('#navegacao').classList.toggle('aberto', aberto);
});
$('#navegacao')
  .querySelectorAll('a')
  .forEach((a) =>
    a.addEventListener('click', () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Abrir menu');
      $('#navegacao').classList.remove('aberto');
    })
  );
function mensagem(texto, tipo, registrar = true) {
  const el = document.createElement('div');
  el.className = 'msg ' + tipo;
  el.textContent = texto;
  $('#mensagens').append(el);
  $('#mensagens').scrollTop = $('#mensagens').scrollHeight;
  if (registrar) {
    conversa.push({ texto, tipo });
    conversa = conversa.slice(-40);
    persistirChat();
  }
  return el;
}
function atalhos(itens) {
  const grupo = document.createElement('div');
  grupo.className = 'atalhos';
  for (const texto of itens) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = texto;
    b.addEventListener('click', () => enviarMensagem(texto));
    grupo.append(b);
  }
  $('#mensagens').append(grupo);
  $('#mensagens').scrollTop = $('#mensagens').scrollHeight;
}
function persistirChat() {
  salvar(sessionStorage, 'obrafacil.chat.gemini.v1', { atendimento, conversa });
  $('#transferir').hidden = !atendimento.servico;
}
function boasVindas() {
  mensagem(
    'Oi! Sou o Mestre Zé, seu assistente virtual. Ajudo a escolher um serviço e preparar seu pedido de visita. O que sua casa precisa?',
    'bot'
  );
  atalhos(['Ver serviços', 'Quero um orçamento', 'Preparar uma visita']);
}
function abrirChat() {
  ultimoFoco = document.activeElement;
  $('#chat').hidden = false;
  $('#chat-bolha').hidden = true;
  $('#chat-bolha').setAttribute('aria-expanded', 'true');
  $('#entrada').focus({ preventScroll: true });
  $('#mensagens').scrollTop = $('#mensagens').scrollHeight;
}
function fecharChat() {
  const estavaAberto = !$('#chat').hidden;
  $('#chat').hidden = true;
  $('#chat-bolha').hidden = false;
  $('#chat-bolha').setAttribute('aria-expanded', 'false');
  if (estavaAberto)
    (ultimoFoco?.isConnected ? ultimoFoco : $('#chat-bolha')).focus({ preventScroll: true });
}
document
  .querySelectorAll('[data-abrir-chat]')
  .forEach((b) => b.addEventListener('click', abrirChat));
$('#chat-bolha').addEventListener('click', abrirChat);
$('#fechar-chat').addEventListener('click', fecharChat);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharChat();
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    $('#navegacao').classList.remove('aberto');
  }
});
function proximaPergunta() {
  if (!atendimento.servico) {
    atendimento.etapa = 'servico';
    return 'Qual serviço você precisa? Reboco, pintura, lâmpada, tomada, torneira, montagem de móveis ou outro reparo?';
  }
  if (!atendimento.quantidade) {
    atendimento.etapa = 'quantidade';
    return servicos.find((s) => s.nome === atendimento.servico).pergunta;
  }
  if (!atendimento.bairro) {
    atendimento.etapa = 'bairro';
    return 'Em qual bairro de Teresina seria o atendimento?';
  }
  if (!atendimento.data) {
    atendimento.etapa = 'data';
    return 'Qual a data desejada? Pode dizer “amanhã” ou informar dia/mês.';
  }
  if (!atendimento.hora) {
    atendimento.etapa = 'hora';
    return 'Qual horário você prefere, entre 8h e 18h? Por exemplo: 14h.';
  }
  atendimento.etapa = 'resumo';
  return (
    'Já organizei os detalhes:\n\n' +
    resumoChat() +
    '\n\nToque em “Levar dados para o formulário” para revisar, informar nome e WhatsApp e salvar o pedido. A visita ainda precisa de confirmação.'
  );
}
function dataLocal(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
function dataBR(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return iso || 'A definir';
  return iso.split('-').reverse().join('/');
}
function lerData(texto) {
  const n = normalizar(texto);
  let hoje = dataLocal();
  let d = new Date(hoje + 'T12:00:00');
  if (n === 'hoje') return hoje;
  if (/depois de amanha/.test(n)) {
    d.setDate(d.getDate() + 2);
    return dataLocal(d);
  }
  if (/amanha/.test(n)) {
    d.setDate(d.getDate() + 1);
    return dataLocal(d);
  }
  const m = n.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if (!m) return '';
  const ano = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : hoje.slice(0, 4);
  const iso = ano + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  const check = new Date(iso + 'T12:00:00');
  if (
    isNaN(check) ||
    check.getUTCDate() !== +m[1] ||
    check.getUTCMonth() + 1 !== +m[2] ||
    iso < hoje
  )
    return '';
  return iso;
}
function lerHora(texto) {
  const n = normalizar(texto);
  const m = n.match(/\b(\d{1,2})(?::|h)(\d{2})?\b/) || n.match(/^(\d{1,2})$/);
  if (!m) return '';
  const hora = +m[1],
    minuto = +(m[2] || 0);
  if (hora < 8 || hora > 18 || minuto > 59 || (hora === 18 && minuto > 0)) return '';
  return String(hora).padStart(2, '0') + ':' + String(minuto).padStart(2, '0');
}
function resumoChat() {
  return [
    'Serviço: ' + atendimento.servico,
    atendimento.quantidade && 'Detalhes: ' + atendimento.quantidade,
    atendimento.bairro && 'Bairro: ' + atendimento.bairro,
    atendimento.data && 'Data desejada: ' + dataBR(atendimento.data),
    atendimento.hora && 'Horário desejado: ' + atendimento.hora,
    'Preferência: ' + atendimento.preferencia,
  ]
    .filter(Boolean)
    .join('\n');
}
// A resposta agora vem do Gemini, por meio do nosso servidor.
async function enviarMensagem(texto) {
  if (enviando || !texto.trim()) return;
  enviando = true;
  const botao = document.querySelector('#form-chat button');
  botao.disabled = true;
  const historico = conversa.slice(-16);
  mensagem(texto.trim().slice(0, 2000), 'usuario');
  $('#entrada').value = '';
  const espera = mensagem('Mestre Zé está pensando…', 'bot', false);
  try {
    const resposta = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: texto.trim(), historico, atendimento }),
      signal: AbortSignal.timeout(100000),
    });
    const dados = await resposta.json();
    if (!resposta.ok)
      throw new Error(dados.erro || 'Não consegui consultar o Gemini. Tente novamente.');
    if (dados.origem !== 'gemini' || !dados.resposta)
      throw new Error('O Gemini não retornou uma resposta válida.');
    atendimento = { ...estadoInicial(), ...dados.atendimento };
    espera.remove();
    mensagem(dados.resposta, 'bot');
    if (!atendimento.servico && /servic|orcamento|visita/.test(normalizar(texto)))
      atalhos(servicos.slice(0, 6).map((s) => s.nome));
    persistirChat();
  } catch (erro) {
    espera.textContent =
      erro.name === 'TimeoutError'
        ? 'O Gemini demorou para responder. Tente novamente.'
        : erro.message;
    const repetir = document.createElement('button');
    repetir.type = 'button';
    repetir.className = 'text-btn';
    repetir.textContent = 'Tentar novamente';
    repetir.addEventListener('click', () => {
      espera.remove();
      repetir.remove();
      enviarMensagem(texto);
    });
    $('#mensagens').append(repetir);
  } finally {
    enviando = false;
    botao.disabled = false;
    $('#mensagens').scrollTop = $('#mensagens').scrollHeight;
  }
}
$('#form-chat').addEventListener('submit', (e) => {
  e.preventDefault();
  enviarMensagem($('#entrada').value);
});
function preencherChat() {
  if (atendimento.servico) $('#servico').value = atendimento.servico;
  for (const campo of ['bairro', 'data', 'hora', 'preferencia'])
    if (atendimento[campo]) $('#' + campo).value = atendimento[campo];
  const descricao = [atendimento.descricao, atendimento.quantidade].filter(Boolean);
  if (descricao.length) $('#descricao').value = [...new Set(descricao)].join('\n');
}
$('#transferir').addEventListener('click', () => {
  preencherChat();
  $('#resultado').hidden = true;
  $('#formulario').hidden = false;
  fecharChat();
  $('#contato').scrollIntoView({ behavior: 'instant' });
  $('#formulario [name=nome]').focus({ preventScroll: true });
  toast('Detalhes levados para o formulário. Revise seus dados.');
});
$('#reiniciar').addEventListener('click', () => {
  atendimento = estadoInicial();
  conversa = [];
  $('#mensagens').replaceChildren();
  boasVindas();
  persistirChat();
  $('#entrada').focus();
});
document.querySelectorAll('[data-servico]').forEach((b) =>
  b.addEventListener('click', () => {
    const servico = b.dataset.servico;
    $('#servico').value = servico;
    abrirChat();
    enviarMensagem('Preciso de ' + servico + '.');
  })
);
const salvoChat = ler(sessionStorage, 'obrafacil.chat.gemini.v1');
if (
  salvoChat &&
  Array.isArray(salvoChat.conversa) &&
  salvoChat.conversa.length &&
  salvoChat.atendimento &&
  servicos.some((s) => s.nome === salvoChat.atendimento.servico)
) {
  atendimento = { ...estadoInicial(), ...salvoChat.atendimento };
  for (const item of salvoChat.conversa.slice(-40))
    if (typeof item.texto === 'string' && ['bot', 'usuario'].includes(item.tipo)) {
      mensagem(item.texto, item.tipo, false);
      conversa.push(item);
    }
  persistirChat();
} else boasVindas();
const formulario = $('#formulario');
$('#data').min = dataLocal();
const tel = formulario.elements.whatsapp;
tel.addEventListener('input', () => {
  tel.setCustomValidity('');
});
$('#data').addEventListener('input', () => $('#data').setCustomValidity(''));
function textoPedido(p) {
  return (
    'OBRAFÁCIL — SOLICITAÇÃO DE VISITA\n' +
    p.id +
    '\n\nNome: ' +
    p.nome +
    '\nWhatsApp: ' +
    p.whatsapp +
    '\nServiço: ' +
    p.servico +
    '\nBairro: ' +
    p.bairro +
    '\nData desejada: ' +
    dataBR(p.data) +
    '\nHorário desejado: ' +
    p.hora +
    '\nPreferência: ' +
    p.preferencia +
    '\n\nDescrição:\n' +
    p.descricao +
    '\n\nPedido salvo neste dispositivo. Visita, preço e disponibilidade sujeitos à confirmação da equipe. Este resumo não confirma agendamento.'
  );
}
function exibirPedido(p) {
  pedidoSalvo = p;
  $('#resumo').textContent = textoPedido(p);
  formulario.hidden = true;
  $('#resultado').hidden = false;
}
formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const digitos = tel.value.replace(/\D/g, '');
  if (!/^(?:55)?\d{10,11}$/.test(digitos)) {
    tel.setCustomValidity('Informe o DDD e um telefone válido, com 10 ou 11 dígitos.');
    tel.reportValidity();
    return;
  }
  if ($('#data').value < dataLocal()) {
    $('#data').setCustomValidity('Escolha uma data a partir de hoje.');
    $('#data').reportValidity();
    return;
  }
  const p = Object.fromEntries(new FormData(formulario));
  for (const k of Object.keys(p)) p[k] = p[k].trim();
  if (!p.nome || !p.bairro || !p.descricao) {
    toast('Preencha nome, bairro e descrição com informações válidas.');
    return;
  }
  p.id = pedidoSalvo?.id || 'OF-' + Date.now().toString(36).toUpperCase();
  p.salvoEm = new Date().toISOString();
  const ok = salvar(localStorage, 'obrafacil.pedido.v1', p);
  if (!ok) {
    toast('O navegador não permitiu salvar. Você ainda pode copiar ou baixar o pedido.');
  }
  exibirPedido(p);
  $('#resultado').scrollIntoView({ behavior: 'instant', block: 'center' });
});
$('#copiar').addEventListener('click', async () => {
  if (!pedidoSalvo) return;
  try {
    await navigator.clipboard.writeText(textoPedido(pedidoSalvo));
    toast('Resumo copiado!');
  } catch {
    const area = document.createElement('textarea');
    area.value = textoPedido(pedidoSalvo);
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    toast(ok ? 'Resumo copiado!' : 'Selecione o resumo para copiar manualmente.');
  }
});
$('#baixar').addEventListener('click', () => {
  if (!pedidoSalvo) return;
  const url = URL.createObjectURL(
    new Blob([textoPedido(pedidoSalvo)], { type: 'text/plain;charset=utf-8' })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = pedidoSalvo.id + '-obrafacil.txt';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#editar').addEventListener('click', () => {
  if (pedidoSalvo)
    for (const [nome, valor] of Object.entries(pedidoSalvo)) {
      const campo = formulario.elements.namedItem(nome);
      if (campo) campo.value = valor;
    }
  $('#resultado').hidden = true;
  formulario.hidden = false;
  formulario.elements.nome.focus({ preventScroll: true });
});
$('#apagar').addEventListener('click', () => {
  try {
    localStorage.removeItem('obrafacil.pedido.v1');
  } catch {}
  pedidoSalvo = null;
  formulario.reset();
  $('#resultado').hidden = true;
  formulario.hidden = false;
  toast('Pedido apagado deste dispositivo.');
});
const existente = ler(localStorage, 'obrafacil.pedido.v1');
if (
  existente &&
  typeof existente.id === 'string' &&
  servicos.some((s) => s.nome === existente.servico)
) {
  exibirPedido(existente);
}
