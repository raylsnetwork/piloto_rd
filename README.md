<p align="center">
  <a href="" rel="noopener">
 <img src="https://public-professional-services.s3.eu-west-2.amazonaws.com/parfinlog.jpg" alt="Project logo"></a>
</p>
<h3 align="center"></h3>

# <p align="center"> Introdução </p>

A Parfin, por meio de sua blockchain layer 0, a Rayls, permite a criação de ambientes permissionados compatíveis com EVM. Através dessa infraestrutura, é possível desenvolver ecossistemas que integram diversas redes privadas de forma que as mensagens que trafegam pela rede sejam totalmente confidenciais, por meio de criptografia ponto a ponto. 

Dessa forma, torna-se possível o desenvolvimento de aplicações descentralizadas como DeFi, Tokenização, entre outras. Tudo com compatibilidade, interoperabilidade, composabilidade e robustez.

<br/>
<br/>
<br/>

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

Para maiores informações sobre a infraestrutura topológica da Rayls e da VEN, [clique aqui](./docs/arquitetura).

<br/>
<br/>
<br/>

# <p align="center"> Exemplos </p>

Os seguintes arquivos-fonte foram criados com o intuito de dar ao participante, um ponto de partida, um guia, sobre como interagir dos contratos inteligentes mencionados acima. Para mais informações sobre os contratos que foram desenvolvidos, [clique aqui](./docs/casos-uso-drex.md).

Os exemplos foram escritos em Typescript, utilizando o framework [Hardhat](https://hardhat.org/). Isso não é uma recomendação do uso da ferramenta por parte da Parfin. Os participantes são livres para desenvolverem a interação com os contratos inteligente da forma que bem entenderem.

Os códigos foram testados em sua funcionalidade, todavia, não foram realizadas auditorias nem análises de vulnerabilidade. Não é recomendado o uso de tais códigos em produção, especialmente o uso de chaves privadas diretamente no arquivo de configuração do Hardhat.

Antes de executar os scripts de exemplo, é imperativo que sejam preenchidas as informações do arquivo [.env](.env.example). Em seguida, executar o script de setup, [setup-participant-contracts.ts](./setup/setup-participant-contracts.ts). Por fim, os scripts de exemplo exigem que as informações necessárias para executar as transações sejam preenchidas. Tais informações estão delineadas entre parênteses angulares (por exemplo: `<informações a serem preenchidas>`).

Para rodar cada o setup e cada um dos exemplos que se seguem abaixo é necessário rodar o comando `run` do [Hardhat](https://hardhat.org/), sempre apontando para a rede desejada. Exemplo abaixo:

`npx hardhat run exemplos/ex1-requisitar-emissao-cbdc.ts --network rayls`

<br/>

### CDBC (atacado)

Os exemplos desta seção correspondem às ações que podem ser realizadas e que envolvem exclusivamente o contrato `CBDC`.

- [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts): faz uma soliticação de emissão de novos CBDC para receber em uma conta;

- [ex2-transferir-cbdc-atacado.ts](./exemplos/ex2-transferir-cbdc-atacado.ts): a partir da instituição de origem, envia Real Digital para uma segunda instituição de destino (atacado);

- [ex3-reversao-transferencia-cbdc-atacado.ts](./exemplos/ex3-reversao-transferencia-cbdc-atacado.ts): tenta realizar o envio de Real Digital para uma conta não autorizada, mas tem o envio revertido devido à não autorização;

- [opcional_add-conta-allowlist-cdbc](./exemplos/opcional_add-conta-allowlist-cdbc.ts): autoriza uma conta a receber CDBC; 

- [opcional_remove-conta-allowlist-cdbc](./exemplos/opcional_remove-conta-allowlist-cdbc.ts): desautoriza uma conta a receber CDBC;

Caso queira maiores detalhes sobre os pré-requisitos necessários para executar cada script, [clique aqui](./docs/atacado-cbdc.md).

<br/>

### Real Tokenizado (atacado)

O exemplo desta seção corresponde às ações que podem ser realizadas e que envolvem o contrato `RealTokenizado`.

- [ex4-transferir-realtokenizado-varejo.ts](./exemplos/ex4-transferir-realtokenizado-varejo.ts): a partir de um cliente em uma instituição de origem, envia Real Digital da reserva, bem como Real Tokenizado para uma segunda conta de cliente em uma instituição de destino (varejo);

Caso queira maiores detalhes sobre os pré-requisitos necessários para executar cada script, [clique aqui](./docs/varejo-real-tokenizado.md).

<br/>

### Delivery versus Payment (DVP) entre Instituições Financeiras (IF)

O exemplo desta seção corresponde a algumas ações que podem ser realizadas e que envolvem o contrato `TPFToperation`.

- [ex5-dvp-if-registro-vendedor.ts](./exemplos/ex5-dvp-if-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras);

- [ex6-dvp-if-registro-comprador.ts](./exemplos/ex6-dvp-if-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras);

- [ex7-dvp-if-req-reversao-vendedor.ts](./exemplos/ex7-dvp-if-req-reversao-vendedor.ts): realiza o cancelamento (reversão) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras);

- [ex8-dvp-if-req-reversao-comprador.ts](./exemplos/ex8-dvp-if-req-reversao-comprador.ts): realiza o cancelamento (reversão) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras);

- [ex9-dvp-if-resgate-comprador.ts](./exemplos/ex9-dvp-if-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras); 

- [ex10-dvp-if-resgate-vendedor.ts](./exemplos/ex10-dvp-if-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras); 

Caso queira maiores detalhes sobre os pré-requisitos necessários para executar cada script, [clique aqui](./docs/dvp-entre-ifs.md).

<br/>

### Delivery versus Payment (DVP) entre Clientes

O exemplo desta seção corresponde a ainda mais ações que podem ser realizadas e que envolvem o contrato `TPFToperation`.

- [ex11-transferir-tpft-entre-wd-e-cliente.ts](./exemplos/ex11-transferir-tpft-entre-wd-e-cliente.ts): realiza a transferência de Título Público Federal Tokenizado entre contas de uma mesma instituição financeira;

- [ex12-dvp-cliente-registro-vendedor.ts](./exemplos/ex12-dvp-cliente-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras); 

- [ex13-dvp-cliente-registro-comprador.ts](./exemplos/ex13-dvp-cliente-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

- [ex14-dvp-cliente-resgate-vendedor.ts](./exemplos/ex14-dvp-cliente-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras); 

- [ex15-dvp-cliente-resgate-comprador.ts](./exemplos/ex15-dvp-cliente-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

Caso queira maiores detalhes sobre os pré-requisitos necessários para executar cada script, [clique aqui](./docs/dvp-entre-clientes.md).

<br/>
<br/>
<br/>

# Perguntas Frequentes (FAQ):

1. Qual a utilidade da variável de ambiente ENDPOINT_ADDR? Onde posso encontrar essa informação?
    - É o endereço do contrato Endpoint que, por sua vez, faz parte do protocolo de comunicação cross-chain da Rayls. Esse endereço é informado no output do console do Relayer, um dos componentes do ambiente de infraestrutura necessária para ter uma Rayls em plena execução. Para maiores informações sobre o setup do Relayer, [clique aqui](https://github.com/raylsnetwork/piloto_rd_setup/blob/main/kubernetes/README.md#rayls-relayer).

2. Como posso consultar meus saldos de Real Tokenizado, DREX ou TPFt?
    - Para consultar seu saldo, é preciso invocar a função `balanceOf` a partir de algum dos respectivos contratos. O endereço dos contratos podem ser descobertos a partir de seu resourceId. Veja os exemplos 1, 3 e 5, para ter modelos de como consultar saldo - com base nesses exemplos, você poderia criar um script próprio, customizando sua checagem de saldos.

3. Como devo preencher as informações necessárias para realizar uma operação de DVP?
    - `operationId`: identificador único da operação, informação que deve ser acordada previamente de antemão entre as partes envolvidas no DVP - dado do tipo `string`;
    - `chainIdSeller`: Chain ID da PL do participante vendedor - dado do tipo `inteiro`;
    - `chainIdBuyer`: Chain ID da PL do participante comprador - dado do tipo `inteiro`;
    - `accountSeller`: conta da PL do participante vendedor - dado do tipo `address`;
    - `accountBuyer`: conta da PL do participante comprador - dado do tipo `address`;
    - `tpftData`: "metadados" de um TPFt (token ERC20);
      - `acronym`: acrônimo do TPFt, por ex. "LTN" - dado do tipo `string`;
      - `code`: código do TPFt, por ex. "BRSTNCLTN7D3" - dado do tipo `string`;
      - `maturityDate`: data de maturidade do TPFt, formato UNIX timestamp, por ex. "1719411661" - dado do tipo `inteiro`;
    - `tpftAmount`: quantidade de TPFt - dado do tipo `inteiro`;
    - `price`: preço unitário por TPFt - dado do tipo `inteiro`;
    - `status`: estado inicial da operação, para vendedor, é sempre igual a 1, já para comprador, sempre igual a 2, independentemente do estado anterior da operação - dado do tipo `inteiro`;
    - `isBetweenClients`: falso (`false`) para operação entre instituições financeiras, verdadeiro (`true`) para operação entre clientes finais de instituições financeiras - dado do tipo `booleano`.

4. Estou tentando executar um exemplo, mas a transação da erro quando eu executo. O que fazer?
    - Caso alguma de suas transações reverta, uma das opções utilizar o `data` da transação para tentar decodar com base nas ABIs disponíveis no projeto. A partir disso, você será capaz de conhecer melhor a mensagem de erro que justifica a reversão da respectiva transação e, com isso, poderá tentar readaptar o seu código para que flua como desejado.

5. Meu exemplo começa a executar, porém a contagem que aparece na tela excede 120 segundos e então meu exemplo parece não apresentar um resultado coerente. O que fazer?
    - Isso ocorre quando alguma de suas transações cross-chain falhou. Pode ser que alguma de suas informações do arquivo .env estejam erradas. Verifique e valide cada um dos valores associados às suas variáveis de ambiente. Caso o problema persista, investigue nos logs dos seus componentes:
      - Relayer - Procure por uma mensagem de erro ou reversão associada a operação realizada. Essa mensagem ajudará a identificar o motivo da sua reversão;
      - Privacy ledger - Procure por mensagem de erro associado a execução das transações.

