# ObraFácil

O ObraFácil é um projeto acadêmico de um site de serviços residenciais em Teresina–PI. A ideia é facilitar a busca por pequenos reparos e ajudar o usuário a organizar uma solicitação de visita.

O público-alvo são pessoas de Teresina que precisam de manutenção em casa.

## Integrantes

| Nome | GitHub | Responsabilidade |
|---|---|---|
| Alcimar Pereira Lima Filho | [alcimarksc-boop](https://github.com/alcimarksc-boop) | Chatbot Mestre Zé, servidor Node.js e integração com o Gemini |
| Luis Miguel Miranda Costa | [miguel8-ia](https://github.com/miguel8-ia) | Visual (CSS), responsividade e documentação |
| Marcelo Gomes de Carvalho | [mrcarvalhog](https://github.com/mrcarvalhog) | Estrutura HTML, conteúdo, formulário e imagens |

## Tecnologias utilizadas

- HTML: estrutura e conteúdo do site.
- CSS: cores, imagens, organização e adaptação para celular.
- JavaScript: funcionamento dos botões, formulário e chatbot.
- Node.js: servidor que entrega o site, recebe as mensagens do chat e guarda a chave da API com segurança.
- API do Google Gemini (modelo `gemini-3.5-flash-lite`): inteligência artificial que gera as respostas do Mestre Zé.
- GitHub: organização do código e registro das contribuições do grupo.

Não utilizamos frameworks nem bibliotecas externas nesta versão.

## Como executar

1. Instale o Node.js 22.13 ou mais recente.
2. Baixe e extraia este projeto em uma pasta.
3. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
4. No `.env`, coloque sua chave depois de `GEMINI_API_KEY=`. Mantenha o modelo `gemini-3.5-flash-lite`, usado nos testes desta versão.
5. Abra o terminal na pasta do projeto e execute `npm start`.
   - No Windows, se aparecer o erro "a execução de scripts foi desabilitada neste sistema", use `npm.cmd start`. O resultado é o mesmo.
6. Abra `http://localhost:3000` no navegador.

Não precisa executar `npm install`: esta versão usa apenas recursos do Node.js, sem bibliotecas adicionais. O servidor precisa continuar aberto enquanto o site estiver em uso.

Abrir somente o `index.html` ou usar o Live Server não conecta o Gemini. É necessário executar o servidor com `npm start`.

## Principais funcionalidades

- Menu com acesso às seções do site.
- Cards de reboco, pintura, troca de lâmpada, tomada, torneira e montagem de móveis.
- Opção para solicitar outros serviços.
- Layout adaptado para computador e celular.
- Formulário com serviço, bairro, data, horário e preferência de profissional.
- Validação dos campos do formulário.
- Salvamento do pedido no próprio navegador, com opções de editar, copiar, baixar e apagar.
- Chatbot Mestre Zé, que ajuda a organizar as informações e levá-las ao formulário.

O site é uma demonstração acadêmica. Não envia pedidos para uma equipe nem confirma agendamentos automaticamente. As fotos dos serviços são ilustrativas e foram geradas com IA.

## Chatbot e integração com IA

O Mestre Zé usa a API Gemini para responder sobre os serviços do ObraFácil. Sua persona é um ajudante experiente, acolhedor e direto, que conversa em português simples.

Quando o visitante envia uma mensagem, o JavaScript chama a rota `/api/chat` do nosso servidor. O servidor junta o histórico recente, os dados já informados e as instruções do Mestre Zé, e consulta o Gemini. O resultado volta com a resposta e os detalhes organizados para o formulário.

A chave fica na variável de ambiente `GEMINI_API_KEY`, somente no servidor. O modelo é definido em `GEMINI_MODEL`. A chave não faz parte do HTML, JavaScript do navegador ou repositório.

O assistente não deve inventar preços ou confirmar visitas. Também recebe instruções para se manter no tema do site. Essas orientações são testadas, mas uma IA ainda pode cometer erros. Se a API falhar, o chat avisa e permite tentar novamente; não apresenta respostas programadas como se fossem do Gemini.

As mensagens recentes e os detalhes necessários da conversa são enviados ao Google para gerar a resposta. Nome e WhatsApp são preenchidos no formulário local.

## Organização dos arquivos

- `index.html`: conteúdo, formulário e janela do chat.
- `style.css`: aparência e adaptação para celular.
- `script.js`: botões, formulário, mensagens e comunicação com o servidor.
- `imagens/`: fotos do site.
- `server.js`: servidor Node.js que entrega os arquivos e recebe as mensagens em `/api/chat`.
- `server/gemini.mjs`: instruções do Mestre Zé, validação e consulta à API do Gemini.
- `package.json`: comando para iniciar o projeto.
- `.env.example`: exemplo das configurações, sem chave real.
- `.gitignore`: evita que a chave e arquivos locais sejam enviados ao GitHub.
- `favicon.svg`: ícone da aba.
- `README.md`: apresentação e instruções.

## Onde os dados ficam

O pedido fica salvo no navegador usado para preencher o formulário, por meio do `localStorage`. A conversa usa o `sessionStorage`, que mantém os dados durante a sessão da aba. Esta versão não possui banco de dados nem envio automático de informações para uma equipe.

## Contexto acadêmico

Projeto desenvolvido para a disciplina Desenvolvimento Web para IA, da Faculdade Estadual Piauí — Instituto de Tecnologia (PIT).

Professor: Tiago Martins Ribeiro.

## Hospedagem

O código está em um repositório público no GitHub, com a participação dos três integrantes. Cada integrante fez suas próprias contribuições e commits ao longo do desenvolvimento.

Para disponibilizar o site com Gemini na internet, a hospedagem precisa executar Node.js e permitir configurar a variável `GEMINI_API_KEY`. O GitHub Pages sozinho não executa nosso servidor.

A chave real não está no repositório: o arquivo `.env` está no `.gitignore`. Para trocar a chave localmente, altere apenas o `.env` e reinicie o servidor. Em uma hospedagem, altere o segredo `GEMINI_API_KEY` nas configurações da plataforma, sem editar o layout ou o código do chat.

## Como explicar o funcionamento

O HTML monta a página, o CSS cuida do visual e o JavaScript captura a mensagem. O JavaScript envia a mensagem ao nosso servidor. O servidor acrescenta as orientações do Mestre Zé e consulta a API do Google. O Gemini devolve a resposta e os dados organizados; o site mostra a resposta e permite transferir os detalhes para o formulário. A chave é usada somente no servidor.
