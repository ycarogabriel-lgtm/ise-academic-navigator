As alterações solicitadas para a visualização e o fluxo do calendário e da grade surgiram da necessidade da equipe de planejamento de ter uma ferramenta que reflita a dinâmica real de "dança das cadeiras" e alocação de recursos (professores e salas), focando no que está disponível em vez de apenas no que está ocupado.

Abaixo, apresento o contexto detalhado para cada ponto, integrando as discussões e falas registradas nas fontes:

### 1. Visualização Horizontal/Vertical e Seleção de Múltiplos Dias
A equipe de planejamento explicou que a visualização padrão de calendário (dias em colunas e horários em linhas) não é ideal para gerenciar recursos. Eles solicitaram uma inversão: **recursos (professores/salas) na esquerda e horários no topo**. Além disso, pediram a capacidade de selecionar dias não sequenciais para visualização lado a lado, como no Outlook.
*   **Contexto:** Letícia mencionou que essa visualização facilita enxergar o bloco da sessão do professor e arrastá-lo entre diferentes recursos. Luis exemplificou a seleção de dias: *"Eu quero selecionar o dia 11, o dia 25 e o dia 30 de novembro... eu consigo ver os dias lado a lado aqui. Eu não tô vendo por semana"*.

### 2. Filtro para Recursos Não Alocados (Visualização do "Livre")
Atualmente, os filtros mostram o que está ocupado, mas o planejamento precisa do inverso para saber onde encaixar novas atividades.
*   **Falas Chave:** Luis explicou: *"O filtro, ele me mostra o que tá ocupado, né? Eu quero ver o que não está ocupado... o raciocínio é muito complicado que eu tenho que fazer para cada quadradinho desse aí"*. Gláucia reforçou: *"Para o planejamento não adianta a gente ver o que está bloqueado... o que está livre para a gente é que o interessa"*.

### 3. Arrastar Sessões com Feedback de Conflitos
A ideia é permitir que o usuário "jogue" as sessões entre professores ou salas diretamente na grade, com o sistema sinalizando se aquela ação é válida.
*   **Contexto:** Marcilene explicou a regra de sinalização: *"Caso uma atividade seja arrastada para um horário já ocupado ou viole uma regra, o sistema deve exibir o bloco ou a borda em vermelho para indicar o conflito em tempo real"*.

### 4. Eliminação de "Buracos" e Efeito Snap/Dominó
Houve uma longa discussão sobre a entidade "Dia de Aula". O sistema deve garantir que, se uma atividade mudar, todas as outras se ajustem para manter a sequência (Café > Sessão 1 > Intervalo > Sessão 2...).
*   **Falas Chave:** Letícia foi enfática: *"O sistema não pode permitir furo. Isso não pode existir... o sistema tem que entender que é uma encavalada na outra"*. Luis complementou: *"Eu posso trocar início, duração e rearrumar as atividades e elas vão manter sempre o snap... tá sempre grudado e mantém essa coerência"*.

### 5. Modal de Confirmação para Grade Incompleta
Em vez de travar o envio de uma grade que ainda possui espaços vazios, o sistema deve apenas alertar o usuário, permitindo flexibilidade no processo de aprovação.
*   **Contexto:** Rivaldo explicou sua proposta: *"O que eu tinha colocado foi uma mensagem de confirmação... quando o usuário não tiver terminado tudo. Aí ele traz essa mensagem para ver se ele quer confirmar de fato ou não"*.

### 6. Ajuste Automático de Atividades Subsequentes
Diferente de apenas arrastar um bloco, alterar o horário de início de uma atividade deve "empurrar" ou "puxar" todo o cronograma restante do dia.
*   **Falas Chave:** Débora explicou a lógica: *"A única coisa que a gente insere é o horário de início, que determina a sequência do dia e o tempo de cada sessão... e isso modifica [tudo]"*. Letícia adicionou: *"Quando a gente arrasta a primeira atividade... todas as atividades ficam mais tardias"*.

### 7. Status de Ocupação (Heatmap) com Tooltip Detalhado
A visualização mensal/trimestral deve funcionar como um mapa de calor (verde/amarelo/vermelho) para identificar rapidamente a lotação da escola e permitir ver detalhes sem precisar clicar.
*   **Falas Chave:** Gláucia sugeriu: *"Seria legal... no dia 3 de março... ele está vermelho. Quando ele está vermelho, se eu passar só o mouse em cima dele, ele me daria todas as salas... com os nomes dos programas que estão alocados"*. Letícia sugeriu que o código de cores fosse baseado na quantidade de salas: verde (tudo livre), laranja (metade livre), vermelho (nada livre).

### 8. Sugestão Automática de Datas
A equipe sentiu falta de uma inteligência que "concatenasse" a disponibilidade de professores específicos e salas.
*   **Contexto:** Letícia explicou: *"Eu senti falta de um botão que o sistema me dê sugestões de boas datas para fazer o programa, considerando sala, professor... como que ele vai concatenar isso para eu passar essa consulta para o diretor de programa?"*.

### 9. Exportação de Relatórios Conforme Filtros
A exportação deve ser dinâmica, refletindo exatamente o que o usuário filtrou ou está vendo na tela no momento.
*   **Contexto:** Rivaldo confirmou que o sistema *"exportaria um PDF ou poderia ser outro tipo de arquivo também de acordo com o que vocês estivessem vendo aqui... pode ser também em lista"*. Marcilene ressaltou que o formato final (Excel ou PDF) seria definido conforme a viabilidade técnica e a necessidade de layout.