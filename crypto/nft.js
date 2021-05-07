// SDK & Node setup
const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk');
const {Crypto}= require('@aeternity/aepp-sdk');

const ServerKey = Crypto.generateKeyPair();

const yourPrivateKey = ServerKey.privateKey;
const yourPublicKey = ServerKey.publicKey;

// account that will be used for the transactions
const acc1 = MemoryAccount({ keypair: { secretKey: yourPrivateKey, publicKey: yourPublicKey } });

// a reference to the aeternity blockchain
var Chain;

// instantiate a connection to the aeternity blockchain
const main = async () => {
  const node1 = await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' })
  // const node2 = ...

    Chain = await Ae({
     // This two params deprecated and will be remove in next major release
      url: 'https://sdk-testnet.aepps.com',
      internalUrl: 'https://sdk-testnet.aepps.com',
      // instead use
      nodes: [
        { name: 'someNode', instance: node1 },
        // mode2
      ],
      compilerUrl: 'https://latest.compiler.aepps.com',
      // `keypair` param deprecated and will be removed in next major release
      
      accounts: [
        acc1,
        // acc2
      ],
      address: yourPublicKey

    })
    const height = await Chain.height()
    console.log('Connected to Testnet Node! Current Block:', height)

  
// CONTRACT DEPLOYMENT

// a reference to your contract
var myContract;

// the code of your contract - watch out for correct indentations !
var code = 
`
    



contract BasicNFT =

record state = {
    token_owner : map(string, address), 
    token_owns : map(address, int), 
    token_approvals: map(string, address),
    token_own_names: map(address, list(map(string, bool))) 
    }


stateful entrypoint init() = 
    { token_owner = {},
        token_owns = {},
        token_approvals = {},
        token_own_names = {}}


public stateful entrypoint ownerOfToken(_token_id: string) : option(address) =
    Map.lookup(_token_id, state.token_owner)


public stateful entrypoint approvedForToken(_token_id: string) : option(address) =
    Map.lookup(_token_id, state.token_approvals)
    

public stateful entrypoint transfer (_to: address, _token_id: string) =
    require(String.length(_token_id) >= 1, "Token Id required")
  
    clearApproval(Some(Call.caller), _token_id)
    removeTokenFrom(Call.caller, _token_id)
    addTokenTo(_to, _token_id) 
    
    
    

private stateful function clearApproval(_user: option(address), _token_id: string): bool =
    require(ownerOfToken(_token_id) == _user, "For clearApproval Owner of token is not you!")
    if(Map.member(_token_id, state.token_approvals))
      Map.delete(_token_id, state.token_approvals)
      true
    else
      false
      

private stateful function addTokenTo(_to: address, _token_id: string) =
    require(String.length(_token_id) >= 1, "Token Id required")

    put(state{token_owner[_token_id] = _to})
    
    let old_token_owns_value = Map.lookup(_to, state.token_owns)
    if(old_token_owns_value == None)
        put(state{token_owns[_to] = 1 })
    else
        put(state{token_owns[_to] = state.token_owns[_to] + 1})
    put(state{token_own_names[_to] = [{[_token_id] = true}] })
    

private stateful function removeTokenFrom(_from: address, _token_id: string): string =
    require(String.length(_token_id) >= 1, "Token Id required")
    if((ownerOfToken(_token_id) == Some(_from)) || (approvedForToken(_token_id) == Some(_from)))
      Map.delete(_token_id, state.token_owner)
      put(state{token_owns[_from] = state.token_owns[_from] - 1 })
      put(state{token_own_names[Call.caller] = [{[_token_id] = false}] })
      "Done"
      
    else  
      "cannot done"
        

public stateful entrypoint mint(_token_id: string) =
    require(String.length(_token_id) >= 1, "Token Id required")
    require(ownerOfToken(_token_id) == None, "Token id already exist")

    addTokenTo(Call.caller, _token_id)


public stateful entrypoint burn(_token_id: string) =
    require(String.length(_token_id) >= 1, "Token Id required")

    clearApproval(Some(Call.caller), _token_id)
    removeTokenFrom(Call.caller, _token_id)


public stateful entrypoint approve(_to: address, _token_id: string) =
    require(String.length(_token_id) >= 1, "Token Id required")
    require(ownerOfToken(_token_id) == Some(Call.caller), "The owner is not you for this token id yet!.")

    put(state{token_approvals[_token_id] = _to})


public entrypoint sumOfTokenOwns (): option(int) =
    Map.lookup(Call.caller, state.token_owns)


public entrypoint allTokensOwnedOrNotNow () : option(list(map(string, bool))) = 
    Map.lookup(Call.caller, state.token_own_names)`

// create a contract instance
myContract = await Chain.getContractInstance(code);

// Deploy the contract
try {
  console.log("Deploying contract....")
  console.log("Using account for deployment: ", Chain.addresses());
  await myContract.methods.init();
} catch(e){
  console.log("Something went wrong, did you set up the SDK properly?");
  console.log("Deployment failed: ", e)
}
  console.log("Contract deployed successfully!")
  console.log("Contract address: ", myContract.deployInfo.address)
  console.log("Transaction ID: ", myContract.deployInfo.transaction)
  console.log("\n \n")  
  
  

// CONTRACT FUNCTION CALL

exports.Card = (UserKeyPair) => {

    // the name of the function you want to call
    var yourFunction = "approve";

    // the parameters of your function
    yourParams = [UserKeyPair, 2];

    // call your function
    console.log("Calling your function: " + yourFunction);
    try{
    let callresult = await myContract.methods[yourFunction](...yourParams);
    console.log("Transaction ID: ", callresult.hash);
    console.log("Advice: log the full callResult object for more useful information!")
    console.log("Function call returned: ", callresult.decodedResult);
    } catch (e){
    console.log("Calling your function errored: ", e)
    }
    } 
    main();
}
  