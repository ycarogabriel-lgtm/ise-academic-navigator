### 1. Visualização Horizontal/Vertical e Seleção de Múltiplos Dias

A equipe de planejamento explicou que a visualização padrão de calendário (dias em colunas e horários em linhas) não é ideal para gerenciar recursos. Eles solicitaram uma inversão: **recursos (professores/salas) na esquerda e horários no topo**. Além disso, pediram a capacidade de selecionar dias não sequenciais para visualização lado a lado, como no Outlook.

- **Contexto:** Letícia mencionou que essa visualização facilita enxergar o bloco da sessão do professor e arrastá-lo entre diferentes recursos. Luis exemplificou a seleção de dias: _"Eu quero selecionar o dia 11, o dia 25 e o dia 30 de novembro... eu consigo ver os dias lado a lado aqui. Eu não tô vendo por semana"_.

### 2. Filtro para Recursos Não Alocados (Visualização do "Livre")

Atualmente, os filtros mostram o que está ocupado, mas o planejamento precisa do inverso para saber onde encaixar novas atividades.

- **Falas Chave:** Luis explicou: _"O filtro, ele me mostra o que tá ocupado, né? Eu quero ver o que não está ocupado... o raciocínio é muito complicado que eu tenho que fazer para cada quadradinho desse aí"_. Gláucia reforçou: _"Para o planejamento não adianta a gente ver o que está bloqueado... o que está livre para a gente é que o interessa"_.

### 3. Arrastar Sessões com Feedback de Conflitos

A ideia é permitir que o usuário "jogue" as sessões entre professores ou salas diretamente na grade, com o sistema sinalizando se aquela ação é válida.

- **Contexto:** Marcilene explicou a regra de sinalização: _"Caso uma atividade seja arrastada para um horário já ocupado ou viole uma regra, o sistema deve exibir o bloco ou a borda em vermelho para indicar o conflito em tempo real"_.

### 4. Eliminação de "Buracos" e Efeito Snap/Dominó

Houve uma longa discussão sobre a entidade "Dia de Aula". O sistema deve garantir que, se uma atividade mudar, todas as outras se ajustem para manter a sequência (Café > Sessão 1 > Intervalo > Sessão 2...).

- **Falas Chave:** Letícia foi enfática: _"O sistema não pode permitir furo. Isso não pode existir... o sistema tem que entender que é uma encavalada na outra"_. Luis complementou: _"Eu posso trocar início, duração e rearrumar as atividades e elas vão manter sempre o snap... tá sempre grudado e mantém essa coerência"_.

### 5. Modal de Confirmação para Grade Incompleta

Em vez de travar o envio de uma grade que ainda possui espaços vazios, o sistema deve apenas alertar o usuário, permitindo flexibilidade no processo de aprovação.

- **Contexto:** Rivaldo explicou sua proposta: _"O que eu tinha colocado foi uma mensagem de confirmação... quando o usuário não tiver terminado tudo. Aí ele traz essa mensagem para ver se ele quer confirmar de fato ou não"_.

### 6. Ajuste Automático de Atividades Subsequentes

Diferente de apenas arrastar um bloco, alterar o horário de início de uma atividade deve "empurrar" ou "puxar" todo o cronograma restante do dia.

- **Falas Chave:** Débora explicou a lógica: _"A única coisa que a gente insere é o horário de início, que determina a sequência do dia e o tempo de cada sessão... e isso modifica [tudo]"_. Letícia adicionou: _"Quando a gente arrasta a primeira atividade... todas as atividades ficam mais tardias"_.

### 7. Status de Ocupação (Heatmap) com Tooltip Detalhado

A visualização mensal/trimestral deve funcionar como um mapa de calor (verde/amarelo/vermelho) para identificar rapidamente a lotação da escola e permitir ver detalhes sem precisar clicar.

- **Falas Chave:** Gláucia sugeriu: _"Seria legal... no dia 3 de março... ele está vermelho. Quando ele está vermelho, se eu passar só o mouse em cima dele, ele me daria todas as salas... com os nomes dos programas que estão alocados"_. Letícia sugeriu que o código de cores fosse baseado na quantidade de salas: verde (tudo livre), laranja (metade livre), vermelho (nada livre).

### 8. Sugestão Automática de Datas

A equipe sentiu falta de uma inteligência que "concatenasse" a disponibilidade de professores específicos e salas.

- **Contexto:** Letícia explicou: _"Eu senti falta de um botão que o sistema me dê sugestões de boas datas para fazer o programa, considerando sala, professor... como que ele vai concatenar isso para eu passar essa consulta para o diretor de programa?"_.

### 9. Exportação de Relatórios Conforme Filtros

A exportação deve ser dinâmica, refletindo exatamente o que o usuário filtrou ou está vendo na tela no momento.

- **Contexto:** Rivaldo confirmou que o sistema _"exportaria um PDF ou poderia ser outro tipo de arquivo também de acordo com o que vocês estivessem vendo aqui... pode ser também em lista"_. Marcilene ressaltou que o formato final (Excel ou PDF) seria definido conforme a viabilidade técnica e a necessidade de layout.
### **10. Simplificação dos Campos de Cadastro (Programa/Turma)**

Esta solicitação surgiu da percepção de que o protótipo inicial estava "poluído" com campos redundantes ou que não refletiam a realidade operacional.

- **Remoção de campos e realocação da "Modalidade":** Luis Fernando foi enfático ao dizer: _"No programa a gente viu lá uma série de coisas que a gente foi corta, corta, corta..."_. O entendimento é que o **Programa** é apenas uma estrutura de informações, enquanto a **Turma** é onde a execução ocorre. Letícia explicou que a modalidade (presencial, online, blended) deve estar na Turma e no Dia de Aula, pois uma mesma turma pode ter dias com modalidades diferentes.
- **Cargos e Responsáveis:** Foi decidido remover cargos como "Diretor Acadêmico" do cadastro do programa porque, no momento da criação, essa definição muitas vezes ainda não existe. Letícia pontuou: _"O único campo obrigatório é o diretor de programa... o diretor ainda não sabe quem vai ser o DA... então não pode ser obrigatório"_.
- **Campo "Nome Fantasia" Único:** Letícia sugeriu simplificar a interface removendo campos fixos para vários idiomas: _"Eu acho que é desnecessário ter esse nome fantasia em português, espanhol, inglês. A gente deixa um campo só e se precisar, tipo, adicionar"_. Débora Muccillo confirmou que, quando um programa é em inglês, o nome é um só em inglês.
- **Geração Automática do Nome da Turma:** Letícia explicou a regra de negócio para automatizar isso: _"Só o EMBA que utiliza o ano de conclusão. Todos os outros é o ano de início"_.

### **11. Cadastro de Reservas (Bloqueio vs. Reserva)**

A equipe estabeleceu uma distinção conceitual clara para evitar confusões no sistema.

- **Definição:** **Bloqueio** é associado a pessoas/professores, enquanto **Reserva** é voltada para espaços físicos.
- **Remoção de campos irrelevantes:** Campos como "layout da sala", "buffer" e "equipamentos" foram considerados desnecessários para reservas que não sejam de programas acadêmicos (ex: manutenção ou reuniões internas). Luis Fernando comentou: _"Se eu faço uma reserva fora de uma turma... eu não peço por aí que eu quero um projetor... o colaborador vai se virando"_.
- **Solicitante vs. Responsável:** Débora Cristina explicou que o "Solicitante" é quem pede o bloqueio (ex: uma secretária pedindo para um professor), enquanto o "Responsável" é quem executa a ação (geralmente o planejamento). O sistema deve capturar isso automaticamente para evitar redundância.

### **12. Login via SSO Microsoft e Privacidade**

- **Single Sign-On (SSO):** Allyson Moura e Luis Fernando solicitaram a integração com a autenticação da Microsoft para que os usuários não tenham que gerenciar múltiplas senhas e para facilitar a segurança da informação.
- **Remoção de Cards Públicos:** Foi solicitada a remoção dos cards do lado esquerdo da tela inicial do protótipo, pois exibiam informações internas que não deveriam ficar expostas.

### **13. Painel de Tarefas e Entregas (CPL/cPanel)**

Atualmente, o controle de entregas (Moodle, horários, outlines) é feito de forma manual via planilhas no Teams, o que causa obsolescência de dados.

- **Centralização no Sistema:** Letícia propôs integrar o "CPL" (ou cPanel) dentro da Turma para que todos os envolvidos possam atualizar e acompanhar os prazos. Ela explicou: _"Hoje a gente controla por planilha... a gente tem que ficar entrando em cada planilha para ficar controlando... liberei o outline, já mando uma notificação para a próxima etapa"_.
- **Follow-up e Cobrança:** O painel servirá para dar visibilidade a atrasos: _"Hoje eu tenho que ficar entrando planilha por planilha para ver o que está atrasado, para ir lá cobrar o acadêmico"_.

### **14. Outros Pontos (Salas Livres, Pré-reservas e Relatórios)**

- **Visualização de Salas Livres:** O time de planejamento enfatizou que não quer apenas ver o que está ocupado, mas o que está **disponível**. Letícia explicou que programas no ISE ocupam períodos integrais, então é crucial "bater o olho" e ver qual sala está livre a semana inteira.
- **Negociação de Pré-reservas:** Gláucia sugeriu que, ao passar o mouse em um dia "vermelho" (ocupado) no calendário, o sistema mostre os detalhes. Isso permitiria identificar pré-reservas e negociar: _"Quando a gente indicar que esse programa é só uma pré-reserva... eu tendo a visualização... eu posso ir e tentar negociar com a pessoa"_.
- **Relatórios de Ocupação:** Luis Fernando notou que as visualizações de mês, trimestre e semestre no protótipo funcionavam mais como relatórios de mapa de calor (heatmap) do que como calendários operacionais, e pediu que essa distinção ficasse clara para facilitar a leitura da taxa de ocupação.