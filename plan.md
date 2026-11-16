# Plano do portal OAB em Foco — 48º Exame

## Escopo

Construir um portal de estudos em português brasileiro para a 1ª fase do 48º Exame de Ordem Unificado. O calendário oficial consultado prevê a prova objetiva para 10/01/2027, mas marca as datas como sujeitas a alterações. O edital prevê 80 questões em cinco horas e exige no mínimo 15% de questões sobre Ética/Estatuto/Regulamento, Direitos Humanos e Filosofia do Direito. A fonte primária será o edital OAB/FGV e o portal oficial de calendário e provas.

O portal organizará as 20 disciplinas, usando as apostilas já criadas nesta sessão somente como ponto de partida: o conteúdo será revisado e aprimorado para o site, com explicações por tópico, resumo de revisão, pontos de atenção de prova, questões originais comentadas, fontes oficiais e, quando houver recurso verificado, indicação de videoaulas gratuitas. O conteúdo de estudo ficará aberto e legível diretamente nas páginas do site para que ela possa estudar sem baixar arquivos; downloads serão apenas uma opção adicional. As informações aparecerão com data de conferência, distinção entre regra legal e jurisprudência e aviso para revisar edital, alterações e retificações até a data da prova.

Como complemento, a biblioteca oferecerá, por disciplina, as versões PDF e Word já preparadas e um pacote ZIP para quem preferir guardar cópias. O plano diário oferecerá duas visualizações: o plano de 56 dias já organizado com base no cronograma CEISC informado pela usuária; e um intensivo parametrizado de 40 dias a partir de 23/11/2026, com duas disciplinas por dia e uma seleção de dez matérias editável. A seleção exata das dez matérias do VDE ainda não foi informada. Portanto, a interface chamará esse modo de “modelo configurável de 40 dias informado pelo usuário”, não de cronograma oficial do VDE. O período de 02/01 a 09/01 ficará reservado para revisão final e simulados, antes da data de prova prevista.

O simulador semanal permitirá selecionar as matérias/conteúdos estudados e responder 20 questões de múltipla escolha, com correção comentada e meta visível de 18 acertos. Quando a seleção não tiver 20 questões suficientes no banco estático, o site não preencherá silenciosamente com assuntos não estudados: mostrará quantas questões existem e oferecerá um texto pronto para solicitar no chat um simulado novo com base no conteúdo da semana. O progresso e marcações ficarão apenas no navegador da usuária; não haverá conta, login, coleta de dados pessoais, servidor de aplicação ou banco de dados.

A biblioteca de vídeos usará os links públicos já verificados: playlist “Start 1ª fase OAB 48” do Verbo OAB, playlist “OAB 48 em 90 Dias” do Estratégia OAB e canal CEISC. As duas playlists cobrem apenas parte das matérias e algumas aulas podem estar agendadas; o site indicará a cobertura observada e avisará que acesso e gratuidade podem mudar. O portal não prometerá acesso gratuito a curso fechado.

## Experiência e navegação

Rotas principais: `/` para o painel inicial; `/plano` para os cronogramas; `/materias` para o índice; `/materias/:slug` para cada disciplina; `/simulados` para questões e simulados; `/recursos` para vídeos e fontes oficiais; e `/biblioteca` para materiais para baixar. Uma navegação lateral no desktop e uma barra compacta no celular manterão o acesso às áreas principais. O painel inicial resumirá próximo estudo, progresso local, data prevista do exame e atalhos rápidos.

## Arquitetura e dependências

Aplicação estática React + TypeScript + Vite, sem servidor e sem banco. Usará React Router para rotas, uma biblioteca Markdown segura para apresentar os textos didáticos e ícones simples para navegação. O estado de revisão, matérias marcadas e resultado dos simulados será armazenado em `localStorage`; haverá opção para limpar esse progresso. PDFs, DOCX e ZIP serão disponibilizados por armazenamento gerenciado do projeto, sem depender do computador da usuária. Vídeos e páginas OAB/FGV serão links externos identificados como tais. Nenhuma integração de IA ou chave privada será necessária no site.

Estrutura planejada:

- `src/pages/`: painel, planos, lista/detalhe de matérias, simulados, recursos e biblioteca.
- `src/components/`: navegação, cartões de progresso, filtros, questões, fontes e estados vazios.
- `src/content/`: apostilas em Markdown e dados de tópicos, disciplinas, questões e vídeos.
- `src/lib/`: progresso local, seleção de questões, cronogramas e utilitários de formatação.
- `public/manus-routes.json`: rotas estáticas efetivamente usadas pelo site.
- `plan.md` e `TODO.md`: plano aprovado e acompanhamento das entregas.

## Direção visual

Três opções de referência visual consideradas (probabilidades amostradas nas faixas baixas, conforme o fluxo de design): **editorial suíço/jurídico (8%)**, **caderno de revisão acadêmico (5%)** e **mesa de estudos editorial acolhedora (3%)**. Escolha proposta: **editorial suíço/jurídico com acabamento de produto premium e acesso livre**, por favorecer hierarquia visual, leitura rápida e uma experiência completa sem aparência de apostila densa.

- **Acabamento premium sem custo:** identidade consistente, conteúdo completo, navegação fluida, estados vazios úteis, microinterações e acabamento responsivo; sem pagamentos, assinatura, paywall, bloqueio de funcionalidades ou “upsell”. O site só chamará de gratuito aquilo que estiver publicamente disponível e informará limites de conteúdos externos.
- **Princípios:** legibilidade no celular, fontes rastreáveis, hierarquia simples e progresso discreto.
- **Cores:** fundo marfim para leitura prolongada; azul-petróleo profundo para navegação e confiança; cobre/âmbar para destaques e prazos, com contraste acessível.
- **Layout:** navegação lateral com uma coluna principal de leitura no desktop; no celular, barra inferior e seções empilhadas. Evitar cartões em grade como única forma de organizar o conteúdo.
- **Elementos próprios:** marcador de progresso do ciclo, etiquetas “Lei”, “Jurisprudência” e “Fonte oficial”, e trilhas de tópico com contagem de revisão.
- **Interação e movimento:** filtros imediatos, checklists acessíveis por teclado, animações leves de conclusão; respeitar `prefers-reduced-motion`.
- **Tipografia:** Inter/system-ui para navegação e texto utilitário; Source Serif 4/Georgia como alternativa de serifa para títulos e trechos de leitura.
- **Essência da marca:** “OAB em Foco — preparação organizada, com fonte e treino”; personalidade clara, confiável e encorajadora.
- **Voz:** instruções práticas, sem prometer aprovação. Exemplos: “Hoje: revise a regra e teste o que ficou.” e “Errou? Veja o fundamento e marque para retomar.”
- **Marca/logotipo:** lettering textual “OAB em Foco” com um traço de página/índice original; não usar o símbolo oficial da OAB nem sugerir afiliação institucional.
- **Cor assinatura:** azul-petróleo `#236E70`, aplicado com parcimônia a ações e marcadores de progresso.

## Fontes verificadas

- Calendário oficial OAB/FGV: https://examedeordem.oab.org.br/Calendario
- Editais e provas oficiais: https://examedeordem.oab.org.br/EditaisProvas?NumeroExame=18197
- Edital do 48º EOU, PDF oficial: https://oab.fgv.br/arq/651/579325_48%20eou.%20edital%20de%20abertura.%2021.09.2026.%20atualizado..pdf
- Playlist pública Verbo OAB: https://www.youtube.com/playlist?list=PLWCIBiUqF93I
- Playlist Estratégia OAB: https://www.youtube.com/playlist?list=PLPoWgJWtSF8s
- Canal CEISC: https://www.youtube.com/@cursoceisc

## Fluxo de entrega

Após aprovação deste plano, atualizar `TODO.md` com os resultados e requisitos do produto; preparar, revisar e aprimorar o conteúdo e os downloads existentes; implementar a aplicação e o manifesto de rotas; iniciar o Preview; conferir funcionamento das rotas, downloads e layout em desktop/celular; corrigir problemas encontrados. Não publicar o site sem autorização separada. Antes de qualquer checkpoint, verificar a configuração de publicação automática para respeitar esse limite.
