# --- Participante ---

### A - Etapa de setup: 

Antes, preencha o .env, depois...

### Execute, em ordem:

- `npm install`
- No caso dos Particpantes: `npx hardhat run setup/setup-participant-contracts.ts --network rayls`

###  B - Exemplos / Caso de uso (Participante):

Com o .env devidamente preenchido...

### 1) Requisição de emissão de novas CBDCs, execute: 

 - `npx hardhat run exemplos/ex1-requisitar-emissao-cbdc.ts --network rayls`

### 2) STR0004, execute: 

 - `npx hardhat run exemplos/ex2-transferir-cbdc-atacado.ts --network rayls`

### 3) STR0008, execute em ordem (precisa ter certeza de que o CDBC existe nos Rayls Nodes envolvidos): 

 - `npx hardhat run setup/setup-participant-rt.ts --network rayls`, para garantir os access controls (execute apenas antes do primeiro STR0008 - uma única vez)
 - `npx hardhat run exemplos/ex3-transferir-realtokenizado-varejo-swap.ts --network rayls` 
 
### 4) Opcional utilitário - para consultar saldos, execute: 

 - `npx hardhat run exemplos/opcional_consultar-saldos.ts --network rayls`

 </br>
 </br>
 </br>

# --- Emissor de CDBC ---

Antes de mais nada, preencher o .env - vide o arquivo `.env.example`. Muita atenção no preenchimento, em caso de dificuldades, procurar o time técnico da Parfin.

### 1) Setup

- `npm install`
- `npx hardhat run emissor/1-setup-cdbc-issuer.ts`

### 2) Envia CDBC à instituição de destino

- `npx hardhat run emissor/2-mint-and-crosstransfer.ts`