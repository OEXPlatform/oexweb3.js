import BigNumber from 'bignumber.js';
import * as utils from '../utils';
import * as oex from '../oex';
import * as dpos from '../dpos';
import { encode } from 'rlp';
import * as actionTypes from './actionTypes';

/** 
 * contractAccountName
 * payloadInfo = {funcName, types, values}
 * blockNum
**/
export async function readContract(contractAccountName, payloadInfo, blockNum) {
    const payload = '0x' + utils.getContractPayload(payloadInfo.funcName, payloadInfo.types, payloadInfo.values);
    const callInfo = {
        gasPrice: 10000000000,
        actionType: 0,
        from: oex.chainConfig.systemName,
        gasLimit: 200000000,
        toAccountName: contractAccountName,
        assetId: oex.chainConfig.sysTokenID,
        value: 0,
        payload,
        remark: '',
    }
    return oex.call(txInfo, blockNum);
}

/** 
* actionInfo = {accountName, toAccountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {funcName, types, values}
* privateKey
**/
export async function executeContract(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + utils.getContractPayload(payloadInfo.funcName, payloadInfo.types, payloadInfo.values);
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.CALL_CONTRACT,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: actionInfo.toAccountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, toAccountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {funcName, types, values, assetInfos: [[assetId1, value1], [assetId2, value2]]}   // assetInfos.push([assetId1, value1])
* privateKey
**/
export async function executeContractWithMultiAsset(actionInfo, gasInfo, payloadInfo, privateKey) {
    const methodPayload = '0x' + utils.getContractPayload(payloadInfo.funcName, payloadInfo.types, payloadInfo.values);

    const payload = '0x' + encode([[...payloadInfo.assetInfos], methodPayload]).toString('hex');

    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.CALL_CONTRACT_MULTIASSET,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: actionInfo.toAccountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {contractAccountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {contractName, code}
* privateKey
**/
export async function deployContract(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + payloadInfo.code;
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.CREATE_CONTRACT,
                accountName: actionInfo.contractAccountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: actionInfo.contractAccountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {newAccountName, creatorAccountName, publicKey, desc}
* privateKey
**/
export async function createAccount(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.newAccountName, payloadInfo.creatorAccountName, payloadInfo.publicKey, payloadInfo.desc]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.CREATE_NEW_ACCOUNT,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.accountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {founder}
* privateKey
**/
export async function updateAccountFounder(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.founder]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UPDATE_ACCOUNT_FOUNDER,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.accountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {desc}
* privateKey
**/
export async function updateAccountDesc(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.desc]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UPDATE_ACCOUNT_DESC,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.accountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


/** 
* actionInfo = {accountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {threshold, updateAuthorThreshold, authorUpdateList}
* privateKey
**/
export async function updateAccountAuthor(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.threshold, payloadInfo.updateAuthorThreshold, [...payloadInfo.authorUpdateList]]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UPDATE_ACCOUNT_AUTHOR,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.accountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {assetName, symbol, amount, decimals, founder, owner, upperLimit, contractAccountName, desc}
   > amount, upperLimit: BigNumber
* privateKey
**/
export async function issueAsset(actionInfo, gasInfo, payloadInfo, privateKey) {
    const amount = (payloadInfo.amount.toNumber() == 0) ? 0 : ('0x' + payloadInfo.amount.shiftedBy(payloadInfo.decimals).toString(16));
    const upperLimit = (payloadInfo.upperLimit.toNumber() == 0) ? 0 : ('0x' + payloadInfo.upperLimit.shiftedBy(payloadInfo.decimals).toString(16));

    const payload = '0x' + encode([payloadInfo.assetName, payloadInfo.symbol, amount,
                                   payloadInfo.decimals, payloadInfo.founder, payloadInfo.owner, upperLimit, 
                                   payloadInfo.contractAccountName, payloadInfo.desc]).toString('hex');
    
    console.log(oex.chainConfig)
		const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.ISSUE_ASSET,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.assetName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
		console.log(txInfo)
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {assetId, addAmount, toAccount}
* privateKey
**/
export async function increaseAsset(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.assetId, payloadInfo.addAmount, payloadInfo.toAccount]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.INCREASE_ASSET,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.assetName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


/** 
* actionInfo = {accountName, assetId, amount, remark, nonce}
   > assetId: id of asset to be destoryed
   > amount: amount of asset to be destoryed
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {desc}
* privateKey
**/
export async function destoryAsset(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = utils.isEmptyObj(payloadInfo.desc) ? '' : '0x' + encode([payloadInfo.desc]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.DESTORY_ASSET,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.assetName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


/** 
* actionInfo = {accountName, remark, nonce}
   > assetId: id of asset to be destoryed
   > amount: amount of asset to be destoryed
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {assetId, owner}
* privateKey
**/
export async function setAssetOwner(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.assetId, payloadInfo.owner]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.SET_ASSET_OWNER,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.assetName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > assetId: id of asset to be destoryed
   > amount: amount of asset to be destoryed
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {assetId, founder}
* privateKey
**/
export async function updateAssetFounder(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.assetId, payloadInfo.founder]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UPDATE_ASSET_FOUNDER,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.assetName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


/** 
* actionInfo = {accountName, toAccountName, assetId, amount, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* privateKey
**/
export async function transfer(actionInfo, gasInfo, privateKey) {
    const payload = '';
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.TRANSFER,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: actionInfo.toAccountName,
                assetId: actionInfo.assetId,
                amount: '0x' + actionInfo.amount.toString(16),
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {url}
* privateKey
**/
export async function registerCandidate(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.url]).toString('hex');
    const amount = '0x' + new BigNumber(oex.chainConfig.dposParams.candidateMinQuantity).shiftedBy(oex.chainConfig.sysTokenDecimal).toString(16);
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.REG_CANDIDATE,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.dposName,
                assetId: oex.chainConfig.sysTokenID,
                amount,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {url}
* privateKey
**/
export async function updateCandidate(actionInfo, gasInfo, payloadInfo, privateKey) {
    const payload = '0x' + encode([payloadInfo.url]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UPDATE_CANDIDATE_URL,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.dposName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* privateKey
**/
export async function unRegCandidate(actionInfo, gasInfo, privateKey) {
    const payload = '';
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.UNREG_CANDIDATE,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.dposName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}

/** 
* actionInfo = {accountName, remark, nonce}
   > nonce: if not null, will be used in txInfo
* gasInfo = {gasPrice, gasLimit}
* payloadInfo = {candidate, stake}
* privateKey
**/
export async function voteCandidate(actionInfo, gasInfo, payloadInfo, privateKey) {
    const stake = '0x' + new BigNumber(payloadInfo.stake).shiftedBy(oex.chainConfig.sysTokenDecimal).multipliedBy(new BigNumber(oex.chainConfig.dposParams.unitStake)).toString(16);
    const payload = '0x' + encode([payloadInfo.candidate, stake]).toString('hex');
    const txInfo = {
        gasAssetId: oex.chainConfig.sysTokenID,
        gasPrice: gasInfo.gasPrice,
        actions: [
            {
                actionType: actionTypes.VOTE_CANDIDATE,
                accountName: actionInfo.accountName,
                nonce: actionInfo.nonce != null ? actionInfo.nonce : null,
                gasLimit: gasInfo.gasLimit,
                toAccountName: oex.chainConfig.dposName,
                assetId: oex.chainConfig.sysTokenID,
                amount: 0,
                payload,
                remark: actionInfo.remark,
            }
        ]
    }
    const signInfo = await oex.signTx(txInfo, privateKey);
    return oex.sendSingleSigTransaction(txInfo, signInfo);
}


