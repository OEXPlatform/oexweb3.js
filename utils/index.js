import * as abiUtil from 'ethereumjs-abi';
import * as oex from '../oex'
let provider = 'http://127.0.0.1:8545';
let wsToNode = null;
let app = null;

export function setApp() {
  app = true;
}

export function setProvider(providerInfo) {
  provider = providerInfo;
  oex.getChainConfig().then(chainConfig => {
    oex.setChainId(chainConfig.chainId);
  });
}

export function openWebSocket(wsAddr) {
  wsToNode = new WebSocket(wsAddr);
  websocket.onopen = function(evt) { 
    console.log('ws open success');
  }; 
  websocket.onclose = function(evt) { 
    console.log('ws close success');
  }; 
  websocket.onmessage = function(evt) { 
    console.log('get message:' + evt.data);
  }; 
  websocket.onerror = function(evt) { 
    console.log('get error:' + evt.data);
  }; 
}

// data = []
export function getRlpData(data) {
  return encode(data);
}

export async function postToNode(dataToNode) {
  if (app) return dataToNode.data;
  const resp = await fetch(provider, {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToNode.data});
  if (resp == null) {
    throw 'RPC调用失败：' + dataToNode.data;
  }
  const response = await resp.json();
  if (response.error != null) {
    throw response.error.message;
  }
  return response.result;
}

export function hex2Bytes(str) {
  let pos = 0;
  let len = str.length;
  let hexA = new Uint8Array();

  if (len >= 2 && str[0] === '0' && (str[1] === 'x' || str[1] === 'X')) {
    pos = 2;
    len -= 2;
  }
  if (len === 0) {
    return hexA;
  }
  if (len % 2 !== 0) {
    if (pos === 0) {
      str = '0' + str;
    } else {
      str = str.substr(0, pos) + '0' + str.substr(pos);
      len += 1;
    }
  }

  len /= 2;
  hexA = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    const s = str.substr(pos, 2);
    const v = parseInt(s, 16);
    hexA[i] = v;
    pos += 2;
  }
  return hexA;
}
/* funcName: function name
* parameterTypes: all parameter types, eg:  ['uint32', 'bool']
* parameterValues: all parameter values, eg: [99, 1]
*  */
export function getContractPayload(funcName, parameterTypes, parameterValues) {
  return abiUtil.methodID(funcName, parameterTypes).toString('hex') + abiUtil.rawEncode(parameterTypes, parameterValues).toString('hex');
}

export function isValidABI(abiInfo) {
  try {
    if (!Array.isArray(abiInfo)) {
      return false;
    }
    for (const abi of abiInfo) {
      if (abi.type == null) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export function parseContractTxPayload(abiInfo, payload) {
  if (!isValidABI(abiInfo)) {
    return null;
  }
  const retInfo = {};
  let startIndex = 0;
  if (payload.indexOf('0x') == 0) {
    startIndex = 2;
  }
  const encodedFunc = payload.substr(startIndex, 8);
  for (const interfaceInfo of abiInfo) {
    if (interfaceInfo.type === 'function') {
      const funcName = interfaceInfo.name;
      const parameterTypes = [];
      for (const input of interfaceInfo.inputs) {
        parameterTypes.push(input.type);
      }
      const methodId = abiUtil.methodID(funcName, parameterTypes).toString('hex');
      if (methodId == encodedFunc) {
        retInfo.funcName = funcName;
        retInfo.parameterInfos = [];
        const decodedValues = abiUtil.rawDecode(parameterTypes, Buffer.from(payload.substr( 8 + startIndex), 'hex'));
        for (let i = 0; i < decodedValues.length; i++) {
          const parameterInfo = {};
          parameterInfo.name = interfaceInfo.inputs[i].name;
          parameterInfo.type = parameterTypes[i];
          parameterInfo.value = decodedValues[i];
          retInfo.parameterInfos.push(parameterInfo);
        }
        return retInfo;
      }
    }
  }
  return null;
}

export function isEmptyObj(obj) {
  return obj == null || obj == '';
}

export default { isEmptyObj, hex2Bytes, postToNode, getRlpData, setProvider, getContractPayload, 
                 isValidABI, parseContractTxPayload };