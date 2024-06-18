<p align="center">
  <a href="" rel="noopener">
 <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/parfinlog.jpg" alt="Project logo"></a>
</p>
<h3 align="center"></h3>

# <p align="center"> Introdução </p>

A Parfin, por meio de sua blockchain layer 0, a Rayls, permite a criação de ambientes permissionados compatíveis com EVM. Através dessa infraestrutura, é possível desenvolver ecossistemas que integram diversas redes privadas de forma que as mensagens que trafegam pela rede sejam totalmente confidenciais, por meio de criptografia ponto a ponto. 

Dessa forma, torna-se possível o desenvolvimento de aplicações descentralizadas como DeFi, Tokenização, entre outras. Tudo com compatibilidade, interoperabilidade, composabilidade e robustez.

# Estrutura da Rayls 

A seguir, uma breve descrição da estrutura da Rayls.

### Privacy Ledger (PL)

Uma PL é, basicamente, uma blockchain privada construída sobre a tecnologia Parfin Rayls. A Rayls possui uma série de recursos cuja instituição proprietária da PL pode utilizar, a saber: 

- Carteira (wallet) & custódia: útil para criação, gestão e manutenção de contas de interação com a blockchain; 

- Conexão via API & RPC: cujo objetivo é permitir que aplicações no nível de usuário sejam capazes de utilizar a blockchain em sua stack de desenvolvimento; 

- Banco de dados não-relacional: útil para aumentar o desempenho de informações a serem lidas ou escritas na blockchain; 

- Relayer: serviço responsável por garantir que a Privacy Ledger se comunique com outras blockchains, utilizando, para isso, os conceitos de bridge descritos na [EIP-5164](https://eips.ethereum.org/EIPS/eip-5164); 

Cada instituição participante administrará sua própria PL. Vale ressaltar que as informações que trafegam dentro da PL são privadas, ou seja, apenas a organização proprietária da respectiva Privacy Ledger controlará o acesso a tais informações e recursos.

### Value Exchange Network (VEN) 

A VEN existe em um contexto no qual diversas PLs podem se conectar, compondo um ecossistema de blockchains, administrado pelo BACEN. Para garantir a comunicação existe a Commit Chain, uma blockchain privada cujos propósitos são vários, dentre os quais: 

- Servir como infraestrutura central de comunicação entre as PLs participantes da VEN; 

- Gerenciar o recebimento e propagação de mensagens entre PLs distintas, tomando por base a EIP-5164; 

- Implementar privacidade na troca de mensagens de PLs através de técnicas de criptografia. 

Enquanto cada Instituição participará do ecossistema com sua respectiva PL, a Commit Chain é administrada pelo BACEN e instalada em seu ambiente. 

### Infraestrutura topológica 

O esquema ilustrativo, a seguir, demonstra como uma Privacy Ledger de propriedade de uma única instituição é composta, e como ela se relaciona com a Commit Chain: 

<p align="center">
    <a href="" rel="noopener">
        <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/Raylz-e-Commit-Chain+(1).png" alt="Rayls">
    </a>
    <p align="center">
        <span>Estrutura de uma Privacy Ledger e sua relação com a Commit Chain</span>
    </p>
</p>

Como podemos observar, na ilustração acima, os contratos inteligentes podem existir tanto na Privacy Ledger quanto na Commit Chain, sendo elas blockchains distintas e funcionais. A comunicação entre PL e Commit Chain se dará através da figura do Relayer, que é um serviço que realiza escuta ativa de eventos que ocorrem na respectiva PL e propaga tais eventos à(s) blockchain(s) interessada(s), de forma criptografada e, privada. Ou seja, toda e qualquer mensagem que trafega pela VEN através da Commit Chain será confidencial e poderá ser acessível apenas pelas partes autorizadas (terceiros participantes da rede não terão acesso às respectivas trocas de mensagem). 

Em suma, pode-se dizer que a arquitetura da VEN foi construída de forma a garantir que: 

- Tudo o que ocorre dentro de uma PL é privado, e somente os administradores da respectiva PL poderão autorizar acesso a ela; 

- Os contratos inteligentes e protocolos podem ser executados tanto nas PLs quanto na Commit Chain, a depender dos papéis de cada ator na VEN; 

- A comunicação entre PLs se dará por intermédio da Commit Chain, protegida por criptografia de ponta a ponta; 

# Casos de Teste e Contratos Inteligentes 

Os contratos inteligentes desenvolvidos implementam o Real Digital (DREX) como um token ERC20 e o Título Público Federal Tokenizado (TPFt) como um token ERC1155, ambos registrados via Commit Chain e com capacidades de envio e recebimento de mensagens cross-chain dentro da VEN. Ainda, o token Real Tokenizado também foi implementado seguindo o padrão ERC20, todavia, sem a necessidade de ser registrado via Commit Chain, existindo somente nas PLs de cada um dos participantes.  

O caso de testes requestToMint foi implementado de forma que a PL do BACEN seja responsável por autorizar tais ações de emissão de novos DREX.  

Já o caso de teste STR0004 (Transferência de Real Digital entre Participantes) focou em demonstrar como transações de DREX entre diferentes IFs podem ser feitos de forma atômica e garantindo confidencialidade entre as s IFs.  

O caso de teste STR0008 (equivalente ao Swap One Step) focou em demonstrar como é possível que clientes de diferentes IFs participantes podem transacionar entre si.  

Já os casos de testes com TPFt e DVP foram feitos de forma a permitir que a emissão de Títulos Públicos e posterior comercialização de tais títulos, tanto entre instituições apenas, quanto entre clientes de instituições.  

Foram criados os seguintes contratos inteligentes:  

- CDBC.sol: contrato que representa o Real Digital;  

- TPFt.sol: contrato que representa o Título Público Federal Tokenizado;  

- RealTokenizado: contrato que representa reais tokenizados existentes dentro de uma IF;  

- STR.sol: contrato utilizado para que o BACEN receba e processe mensagens para emissão de novos DREX;  

- TPFToperation.sol: contrato utilizado por participantes para registrarem, liquidarem e/ou reverterem operações de DVP;  

- DVP.sol: contrato existente na PL da SELIC cujo objetivo é conciliar e servir como ponto de liquidação de operações de DVP.  

Ainda, foram desenvolvidos os scripts de setup que cada PL deve executar quando do seu ingresso na VEN. Por fim, foram escritos e executados os casos de teste para os requisitos solicitados.  

## Exemplos

Os seguintes arquivos-fonte foram criados com o intuito de dar ao participante, um ponto de partida, um guia, sobre como interagir dos contratos inteligentes mencionados acima.

Os exemplos foram escritos em Typescript, utilizando o framework [Hardhat](https://hardhat.org/). Isso não é uma recomendação do uso da ferramenta por parte da Parfin. Os participantes são livres para desenvolverem a interação com os contratos inteligente da forma que bem entenderem.

Os códigos foram testados em sua funcionalidade, todavia, não foram realizadas auditorias nem análises de vulnerabilidade. Não é recomendado o uso de tais códigos em produção, especialmente o uso de chaves privadas diretamente no arquivo de configuração do Hardhat.

Antes de executar os scripts de exemplo, é imperativo que sejam preenchidas as informações do arquivo [.env](.env.example). Em seguida, executar o script de setup, [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts). Por fim, os scripts de exemplo exigem que as informações necessárias para executar as transações sejam preenchidas. Tais informações estão delineadas entre parênteses angulares (por exemplo: `<informações a serem preenchidas>`).

Para rodar cada o setup e cada um dos exemplos que se seguem abaixo é necessário rodar o comando `run` do [Hardhat](https://hardhat.org/), sempre apontando para a rede desejada. Exemplo abaixo:

`npx hardhat run exemplos/ex1-requisitar-emissao-cbdc.ts --network rayls`

### CBDC (atacado):

- [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts): faz uma soliticação de emissão de novos CBDC para receber em uma conta.

  <strong>Pré-requisitos:</strong> 
  
  1. Antes de mais nada, os contratos da instituição precisam estar implantados no ambiente do participante com a execução do código [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts).

- [ex2-transferir-cbdc-atacado.ts](./exemplos/ex2-transferir-cbdc-atacado.ts): a partir da instituição de origem, envia Real Digital para uma segunda instituição de destino (atacado).
  
  <strong>Pré-requisitos:</strong> 
  
  1. Na origem, o endereço que deseja iniciar a transferência necessita de saldo, portanto, é interessante que o respectivo endereço tenha recebido saldo, por exemplo, através da execução do script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts);

  2. No destino, o endereço destinatário precisa estar autorizado, via allowlist, na PL da instituição de destino, a receber CDBC. Caso o endereço não tenha autorização, basta que os administradores da PL de destino tenham executado o código [opcional_add-conta-allowlist-cdbc.ts](./exemplos/opcional_add-conta-allowlist-cdbc.ts) para autorizar uma conta a receber CDBC na respectiva PL.

- [ex3-reversao-transferencia-cbdc-atacado.ts](./exemplos/ex3-reversao-transferencia-cbdc-atacado.ts): tenta realizar o envio de Real Digital para uma conta não autorizada, mas tem o envio revertido devido à não autorização - ocorre que apenas endereços de contas autorizadas podem receber CDBC.

  <strong>Pré-requisitos:</strong> 

  1. Na origem, o endereço que deseja iniciar a transferência necessita de saldo, portanto, é interessante que o respectivo endereço tenha recebido saldo, por exemplo, através da execução do script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts);

  2. Caso o endereço de destino esteja autorizado a receber CDBCs, no caso deste exemplo, é necessário desautorizar o endereço de destino, através da execução do código [opcional_remove-conta-allowlist-cdbc.ts](./exemplos/opcional_remove-conta-allowlist-cdbc.ts): desautoriza uma conta a receber CDBC.

### Real Tokenizado (varejo):

- [ex4-transferir-realtokenizado-varejo.ts](./exemplos/ex4-transferir-realtokenizado-varejo.ts): a partir de um cliente em uma instituição de origem, envia Real Digital da reserva, bem como Real Tokenizado para uma segunda conta de cliente em uma instituição de destino (varejo).

  <strong>Pré-requisitos:</strong>

  1. A conta de reservas da instituição da qual se deseja iniciar a transferência necessita de saldo de CBDC, portanto, é interessante que o respectivo endereço tenha recebido saldo, por exemplo, através da execução do script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts).

### Delivery versus Payment entre Instituições Financeiras:

Os exemplos a seguir não precisam ser executados, necessariamente, seguindo a numeração destacada no nome dos arquivos. As numerações elencadas nos nomes dos arquivos são apenas um guia. Todavia, é importante observar os pré-requisitos pois, apesar de alguns scripts poderem se executados "fora de ordem", devemos notar que os scripts de registro de operações de DVP devem preceder a execução dos scripts de liquidação das respectivas operações. Em suma: tanto faz a ordem, ao executar os exemplos 5 e 6 - desde que sejam executados antes dos exemplos 9 e 10.

- [ex5-dvp-if-registro-vendedor.ts](./exemplos/ex5-dvp-if-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras).

  <strong>Pré-requisitos:</strong>

  1. Antes de mais nada, os contratos da instituição precisam estar implantados no ambiente do participante com a execução do código [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts);

  2. O endereço da conta que deseja realizar a venda necessita de saldo de TPFt. Para tanto é preciso que uma solicitação off-chain seja feita à SELIC para que, então, a SELIC envie os TPFt solicitados à respectiva conta do vendedor

  3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`).

- [ex6-dvp-if-registro-comprador.ts](./exemplos/ex6-dvp-if-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras).

  <strong>Pré-requisitos:</strong>

  1. Antes de mais nada, os contratos da instituição precisam estar implantados no ambiente do participante com a execução do código [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts);

  2. O endereço da conta que deseja realizar a compra precisa de saldo de CBDC. Portanto, é interessante que o respectivo endereço tenha recebido saldo, por exemplo, através da execução do script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts).

  3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`).

- [ex7-dvp-if-req-reversao-vendedor.ts](./exemplos/ex7-dvp-if-req-reversao-vendedor.ts): caso no qual o vendedor deseja realizar o cancelamento (solicitação de reversão) de uma operação de DVP com Título Público Federal Tokenizado já registrada;

  <strong>Pré-requisitos:</strong>

  1. Ter executado o código [ex5-dvp-if-registro-vendedor.ts](./exemplos/ex5-dvp-if-registro-vendedor.ts);

  2. O endereço da conta que deseja registrar e posteriormente solicitar reversão da operação de venda necessita de saldo de TPFt. Para tanto é preciso que uma solicitação off-chain seja feita à SELIC para que, então, a SELIC envie os TPFt solicitados à respectiva conta do vendedor

  3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`);

  5. O estado (`status`) da operação precisa refletir o fato de que o registro da respectiva operação foi feito apenas pela parte vendedora. Ocorre que, caso ambas as partes tenham feito seus registros, e tais registros tenham sido compatíveis, então não será possível solicitar o cancelamento da operação.

- [ex8-dvp-if-req-reversao-comprador.ts](./exemplos/ex8-dvp-if-req-reversao-comprador.ts): caso no qual o comprador deseja realizar o cancelamento (solicitação de reversão) de uma operação de DVP com Título Público Federal Tokenizado já registrada;

  <strong>Pré-requisitos:</strong>

  1. Ter executado o código [ex6-dvp-if-registro-comprador.ts](./exemplos/ex6-dvp-if-registro-comprador.ts);

  2. O endereço da conta que deseja registrar e posteriormente solicitar reversão da operação de compra precisa de saldo de CBDC. Portanto, é interessante que o respectivo endereço tenha recebido saldo, por exemplo, através da execução do script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts).

  3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`);
  
  5. O estado (`status`) da operação precisa refletir o fato de que o registro da respectiva operação foi feito apenas pela parte compradora. Ocorre que, caso ambas as partes tenham feito seus registros, e tais registros tenham sido compatíveis, então não será possível solicitar o cancelamento da operação.

- [ex9-dvp-if-resgate-comprador.ts](./exemplos/ex9-dvp-if-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras);

  <strong>Pré-requisitos:</strong>

  1. É necessário ter executado o código [ex6-dvp-if-registro-comprador.ts](./exemplos/ex6-dvp-if-registro-comprador.ts) previamente;

  2. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  3. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor, 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`).

- [ex10-dvp-if-resgate-vendedor.ts](./exemplos/ex10-dvp-if-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras); 

  <strong>Pré-requisitos:</strong>

  1. É necessário ter executado o código [ex5-dvp-if-registro-vendedor.ts](./exemplos/ex5-dvp-if-registro-vendedor.ts) previamente;

  2. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  3. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor, 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas instituições, em detrimento de entre dois clientes finais (`isBetweenClients` = `false`).

### Delivery versus Payment entre Clientes de Instituições Financeiras:

- [ex11-transferir-tpft-entre-wd-e-cliente.ts](./exemplos/ex11-transferir-tpft-entre-wd-e-cliente.ts): realiza a transferência de Título Público Federal Tokenizado entre contas de uma mesma instituição financeira;

  <strong>Pré-requisitos:</strong>

  1. O endereço da conta que deseja realizar a venda necessita de saldo de TPFt. Para tanto é preciso que uma solicitação off-chain seja feita à SELIC para que, então, a SELIC envie os TPFt solicitados à respectiva conta do vendedor

- [ex12-dvp-cliente-registro-vendedor.ts](./exemplos/ex12-dvp-cliente-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras);

    <strong>Pré-requisitos:</strong>

    1. Antes de mais nada, os contratos da instituição precisam estar implantados no ambiente do participante com a execução do código [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts);

    2. O endereço do cliente que deseja registrar a operação de venda deve possuir saldo de TPFt. Para tanto, é preciso que o script [ex11-transferir-tpft-entre-wd-e-cliente.ts](./exemplos/ex11-transferir-tpft-entre-wd-e-cliente.ts) tenha sido executado previamente;

    3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

    4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor) da operação e; a informação de confirmação de que a operação será realizada entre duas clientes de instituições (`isBetweenClients` = `true`).

- [ex13-dvp-cliente-registro-comprador.ts](./exemplos/ex13-dvp-cliente-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

    <strong>Pré-requisitos:</strong>

    1. Antes de mais nada, os contratos da instituição precisam estar implantados no ambiente do participante com a execução do código [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts);

    2. O endereço da de reservas da instituição de onde está partindo o registro de compra necessita de saldo de CBDC. Para tanto é preciso ter executado o script [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts) previamente. Também é necessário que a conta do cliente comprador possua saldo de Real Tokenizado;

    3. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

    4. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas clientes de instituições (`isBetweenClients` = `true`).

- [ex14-dvp-cliente-resgate-vendedor.ts](./exemplos/ex14-dvp-cliente-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras); 

  <strong>Pré-requisitos:</strong>

  1. É necessário ter executado o código [ex12-dvp-cliente-registro-vendedor.ts](./exemplos/ex12-dvp-cliente-registro-vendedor.ts) previamente;

  2. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

  3. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 1 p/ vendedor) da operação e; a informação de confirmação de que a operação será realizada entre duas clientes de instituições (`isBetweenClients` = `true`).


- [ex15-dvp-cliente-resgate-comprador.ts](./exemplos/ex15-dvp-cliente-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

    <strong>Pré-requisitos:</strong>

    1. É necessário ter executado o código [ex13-dvp-cliente-registro-comprador.ts](./exemplos/ex13-dvp-cliente-registro-comprador.ts): previamente;

    2. É necessário conhecer os metadados do TPFt (`TPFtData`), a saber: `acronym`, do tipo `string`; `code`, do tipo `string` e; `maturityDate` do tipo `uint256`;

    3. É necessário conhecer dados da operação, a saber: os Chain Ids das partes envolvidas; os endereços das contas envolvidas; os metadados (`TPFtData`) do título negociado; a quantidade (`tpftAmount`) de títulos negociados; o preço (`price`) a ser pago por unidade de TPFt; o estado inicial (`status` - 2 p/ comprador) da operação e; a informação de confirmação de que a operação será realizada entre duas clientes de instituições (`isBetweenClients` = `true`).



# <p align="center"> Diagramas de Sequência: Casos de uso Real Digital (DREX), Real Tokenizado e DVP (TPFt)
</p>

A seguir, seguem ilustrações que esquematizam a sequência de trocas de mensagens entre objetos, seja dentro de uma mesma PL, seja entre PLs distintas.

### Emissão de novos DREX

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/1-requestToMint.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Requisição para emissão de novos Reais Digitais (CDBC)</span>
  </p>
</p>
</br>
</br>

### Transferência de DREX entre IFs

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/2-CBDC-Allowlist.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Fluxos de adição, remoção e checagem para uma conta receber, ou não, Real Dgital (CDBC)</span>
  </p>
</p>
</br>
</br>

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/3-STR0004.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Envio de Real Digital entre instituições financeiras (atacado)</span>
  </p>
</p>
</br>
</br>

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/4-STR0004-Revers%C3%A3o-At%C3%B4mica.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Reversão de envio de Real Digital devido a permissionamento inválido</span>
  </p>
</p>
</br>
</br>

### Transferência de Real Tokenizado entre Clientes de IFs

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/5-STR0008.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Envio de Real Tokenizado entre clientes de instituições financeiras (varejo)</span>
  </p>
</p>
</br>
</br>

### DVP: Negociações de Título Público Federal Tokenizado (TPFt)

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/6-Mint-de-TPFt.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>Emissão de Títulos Públicos Federais Tokenizados</span>
  </p>
</p>
</br>
</br>

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/7-DVP-entre-IFs.drawio.png" alt="Project logo">
  </a>
  <p align="center">
    <span>DVP entre instituições financeiras</span>
  </p>
</p>
</br>
</br>

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/8-DVP-com-Revers%C3%A3o.drawio.png" alt="Project logo">
  </a>
    <p align="center">
    <span>Cancelamento de DVP entre instituições financeiras</span>
  </p>
</p>
</br>
</br>

<p align="center">
  <a href="" rel="noopener">
    <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/9-DVP-entre-Clientes.drawio.png" alt="Project logo">
  </a>
    <p align="center">
    <span>DVP entre clientes de instituições financeiras</span>
  </p>
</p>