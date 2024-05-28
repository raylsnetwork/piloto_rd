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

Ainda, foram desenvolvidos os scripts de SETUP que cada PL deve executar quando do seu ingresso na VEN. Por fim, foram escritos e executados os casos de teste para os requisitos solicitados.  

### Exemplos

Os seguintes arquivos-fonte foram criados com o intuito de dar ao participante, um ponto de partida, um guia, sobre como interagir dos contratos inteligentes mencionados acima.

Os exemplos foram escritos em Typescript, utilizando o framework [Hardhat](https://hardhat.org/). Isso não é uma recomendação do uso da ferramenta por parte da Parfin. Os participantes são livres para desenvolverem a interação com os contratos inteligente da forma que bem entenderem.

Os códigos foram testados em sua funcionalidade, todavia, não foram realizadas auditorias nem análises de vulnerabilidade. Não é recomendado o uso de tais códigos em produção, especialmente o uso de chaves privadas diretamente no arquivo de configuração do Hardhat.

- [cbdc-adicionar-conta-allowlist.ts](./exemplos/cbdc-adicionar-conta-allowlist.ts): autoriza uma conta a receber CDBC; 

- [cbdc-remover-conta-allowlist.ts](./exemplos/cbdc-remover-conta-allowlist.ts): desautoriza uma conta a receber CDBC;

- [ex1-requisitar-emissao-cbdc.ts](./exemplos/ex1-requisitar-emissao-cbdc.ts): faz uma soliticação de emissão de novos CBDC para receber em uma conta;

- [ex2-transferir-cbdc-atacado.ts](./exemplos/ex2-transferir-cbdc-atacado.ts): a partir da instituição de origem, envia Real Digital para uma segunda instituição de destino (atacado);

- [ex3-reversao-transferencia-cbdc-atacado.ts](./exemplos/ex3-reversao-transferencia-cbdc-atacado.ts): tenta realizar o envio de Real Digital para uma conta não autorizada, mas tem o envio revertido devido à não autorização;

- [ex4-transferir-realtokenizado-varejo.ts](./exemplos/ex4-transferir-realtokenizado-varejo.ts): a partir de um cliente em uma instituição de origem, envia Real Digital da reserva, bem como Real Tokenizado para uma segunda conta de cliente em uma instituição de destino (varejo);

- [ex5-dvp-if-registro-vendedor.ts](./exemplos/ex5-dvp-if-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras);

- [ex6-dvp-if-registro-comprador.ts](./exemplos/ex6-dvp-if-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras);

- [ex7-dvp-if-req-reversao-vendedor.ts](./exemplos/ex7-dvp-if-req-reversao-vendedor.ts): realiza o cancelamento (reversão) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras);

- [ex8-dvp-if-req-reversao-comprador.ts](./exemplos/ex8-dvp-if-req-reversao-comprador.ts): realiza o cancelamento (reversão) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras);

- [ex9-dvp-if-resgate-comprador.ts](./exemplos/ex9-dvp-if-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre instituições financeiras); 

- [ex10-dvp-if-resgate-vendedor.ts](./exemplos/ex10-dvp-if-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre instituições financeiras); 

- [ex11-transferir-tpft-entre-wd-e-cliente.ts](./exemplos/ex11-transferir-tpft-entre-wd-e-cliente.ts): realiza a transferência de Título Público Federal Tokenizado entre contas de uma mesma instituição financeira;

- [ex12-dvp-cliente-registro-vendedor.ts](./exemplos/ex12-dvp-cliente-registro-vendedor.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras); 

- [ex13-dvp-cliente-registro-comprador.ts](./exemplos/ex13-dvp-cliente-registro-comprador.ts): realiza o lançamento (registro) de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

- [ex14-dvp-cliente-resgate-vendedor.ts](./exemplos/ex14-dvp-cliente-resgate-vendedor.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto vendedor do ativo (entre clientes de instituições financeiras); 

- [ex15-dvp-cliente-resgate-comprador.ts](./exemplos/ex15-dvp-cliente-resgate-comprador.ts): realiza o resgate de uma operação de DVP com Título Público Federal Tokenizado enquanto comprador do ativo (entre clientes de instituições financeiras); 

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