// src/agentApi/agentApi.mjs
import fetch from 'node-fetch';
import crypto from 'crypto';

const AgentAPI = {
  Host: '',
  Domain: '',
  SessionStorage: {},

  IO: {
    async request(resource, payload, extraHeaders = {}) {
      const url = `${AgentAPI.Domain}${resource}`;
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...extraHeaders
      };

      const token = AgentAPI.Account.GetSessionString("AgentAPI.Token");
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options = {
        method: payload ? 'POST' : 'GET',
        headers: headers,
        body: payload ? JSON.stringify(payload) : undefined
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      return await response.json();
    }
  },

  Account: {
    async DomainInfo(Language) {
      return AgentAPI.IO.request('/Agent/Account/DomainInfo', { Language });
    },

    async Create(UserName, EMail, Password, ApiKey, Secret, Seconds) {
      const Nonce = this.GenerateNonce();
      const Signature = await this.Sign(Secret, `${UserName}:${AgentAPI.Host}:${EMail}:${Password}:${ApiKey}:${Nonce}`);
  
      const payload = {
          userName: UserName,
          eMail: EMail,
          phoneNr: '',
          password: Password,
          apiKey: ApiKey,
          nonce: Nonce,
          signature: Signature,
          seconds: Seconds
      };

      console.log('Payload:', JSON.stringify(payload, null, 2));  
  
      const response = await AgentAPI.IO.request('/Agent/Account/Create', payload);
      this.SaveSessionToken(response.jwt, Seconds);
      return response;
    },

    async GetSessionToken() {
      return AgentAPI.IO.request('/Agent/Account/GetSessionToken');
    },

    async VerifyEMail(EMail, Code) {
      return AgentAPI.IO.request('/Agent/Account/VerifyEMail', { eMail: EMail, code: Code });
    },

    async Login(UserName, Password, Seconds) {
      const Nonce = this.GenerateNonce();
      const Signature = await this.Sign(Password, `${UserName}:${AgentAPI.Host}:${Nonce}`);

      const payload = {
        userName: UserName,
        nonce: Nonce,
        signature: Signature,
        seconds: Seconds
      };

      const response = await AgentAPI.IO.request('/Agent/Account/Login', payload);
      this.SaveSessionToken(response.jwt, Seconds);
      return response;
    },

    async QuickLogin(Seconds) {
      const response = await AgentAPI.IO.request('/Agent/Account/QuickLogin', { seconds: Seconds });
      this.SaveSessionToken(response.jwt, Seconds);
      return response;
    },

    async Refresh(Seconds) {
      const response = await AgentAPI.IO.request('/Agent/Account/Refresh', { seconds: Seconds });
      this.SaveSessionToken(response.jwt, Seconds);
      return response;
    },

    async Logout() {
      const response = await AgentAPI.IO.request('/Agent/Account/Logout');
      this.ClearSessionToken();
      return response;
    },

    async Recover(UserName, PersonalNr, Country, EMail, PhoneNr) {
      return AgentAPI.IO.request('/Agent/Account/Recover', { userName: UserName, personalNr: PersonalNr, country: Country, eMail: EMail, phoneNr: PhoneNr });
    },

    async AuthenticateJwt(Token) {
      return AgentAPI.IO.request('/Agent/Account/AuthenticateJwt', { token: Token });
    },

    GenerateNonce() {
      return crypto.randomBytes(24).toString('base64');
    },

    async Sign(Key, Data) {
      const hmac = crypto.createHmac('sha256', Key);
      hmac.update(Data);
      return hmac.digest('base64');
    },

    SaveSessionToken(Token, Seconds) {
      AgentAPI.SessionStorage['AgentAPI.Token'] = Token;
      AgentAPI.SessionStorage['AgentAPI.TokenExpires'] = Date.now() + Seconds * 1000;
    },

    ClearSessionToken() {
      delete AgentAPI.SessionStorage['AgentAPI.Token'];
      delete AgentAPI.SessionStorage['AgentAPI.TokenExpires'];
    },

    GetSessionString(Key) {
      return AgentAPI.SessionStorage[Key];
    }
  },

  Crypto: {
    async GetAlgorithms() {
      return AgentAPI.IO.request('/Agent/Crypto/GetAlgorithms');
    },

    async CreateKey(LocalName, Namespace, Id, KeyPassword, AccountPassword) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        id: Id,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword
      };
      return AgentAPI.IO.request('/Agent/Crypto/CreateKey', payload);
    },

    async GetPublicKey(KeyId) {
      return AgentAPI.IO.request('/Agent/Crypto/GetPublicKey', { keyId: KeyId });
    }
  },

  Legal: {
    async ValidatePNr(CountryCode, PNr) {
      return AgentAPI.IO.request('/Agent/Legal/ValidatePNr', { countryCode: CountryCode, pNr: PNr });
    },

    async GetApplicationAttributes() {
      return AgentAPI.IO.request('/Agent/Legal/GetApplicationAttributes');
    },

    async ApplyId(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, Properties) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        properties: Properties
      };
      return AgentAPI.IO.request('/Agent/Legal/ApplyId', payload);
    },

    async AddIdAttachment(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, LegalId, Attachment, FileName, ContentType) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        legalId: LegalId,
        attachment: Attachment,
        fileName: FileName,
        contentType: ContentType
      };
      return AgentAPI.IO.request('/Agent/Legal/AddIdAttachment', payload);
    },

    async ReadyForApproval(LegalId) {
      return AgentAPI.IO.request('/Agent/Legal/ReadyForApproval', { legalId: LegalId });
    },

    async GetServiceProvidersForIdReview(LegalId) {
      return AgentAPI.IO.request('/Agent/Legal/GetServiceProvidersForIdReview', { legalId: LegalId });
    },

    async SelectReviewService(ServiceId, ServiceProvider) {
      return AgentAPI.IO.request('/Agent/Legal/SelectReviewService', { serviceId: ServiceId, serviceProvider: ServiceProvider });
    },

    async AuthorizeAccessToId(LegalId, RemoteId, Authorize) {
      return AgentAPI.IO.request('/Agent/Legal/AuthorizeAccessToId', { legalId: LegalId, remoteId: RemoteId, authorize: Authorize });
    },

    async PetitionPeerReview(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, LegalId, RemoteId, PetitionId, Purpose) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        legalId: LegalId,
        remoteId: RemoteId,
        petitionId: PetitionId,
        purpose: Purpose
      };
      return AgentAPI.IO.request('/Agent/Legal/PetitionPeerReview', payload);
    },

    async PetitionId(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, LegalId, RemoteId, PetitionId, Purpose) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        legalId: LegalId,
        remoteId: RemoteId,
        petitionId: PetitionId,
        purpose: Purpose
      };
      return AgentAPI.IO.request('/Agent/Legal/PetitionId', payload);
    },

    async PetitionSignature(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, LegalId, RemoteId, PetitionId, Purpose, Content) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        legalId: LegalId,
        remoteId: RemoteId,
        petitionId: PetitionId,
        purpose: Purpose,
        content: Content
      };
      return AgentAPI.IO.request('/Agent/Legal/PetitionSignature', payload);
    },

    async CreateContract(TemplateId, Visibility, Parts, Parameters) {
      return AgentAPI.IO.request('/Agent/Legal/CreateContract', { templateId: TemplateId, visibility: Visibility, parts: Parts, parameters: Parameters });
    },

    async GetIdentity(LegalId) {
      return AgentAPI.IO.request('/Agent/Legal/GetIdentity', { legalId: LegalId });
    },

    async GetContract(ContractId) {
      return AgentAPI.IO.request('/Agent/Legal/GetContract', { contractId: ContractId });
    },

    async SignContract(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, ContractId, LegalId, Role) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        contractId: ContractId,
        legalId: LegalId,
        role: Role
      };
      return AgentAPI.IO.request('/Agent/Legal/SignContract', payload);
    },

    async SignData(LocalName, Namespace, KeyId, KeyPassword, AccountPassword, LegalId, DataBase64) {
      const payload = {
        localName: LocalName,
        namespace: Namespace,
        keyId: KeyId,
        keyPassword: KeyPassword,
        accountPassword: AccountPassword,
        legalId: LegalId,
        dataBase64: DataBase64
      };
      return AgentAPI.IO.request('/Agent/Legal/SignData', payload);
    },

    async GetIdentities(Offset, MaxCount) {
      return AgentAPI.IO.request('/Agent/Legal/GetIdentities', { offset: Offset, maxCount: MaxCount });
    },

    async GetCreatedContracts(Offset, MaxCount) {
      return AgentAPI.IO.request('/Agent/Legal/GetCreatedContracts', { offset: Offset, maxCount: MaxCount });
    },

    async AuthorizeAccessToContract(ContractId, RemoteId, Authorize) {
      return AgentAPI.IO.request('/Agent/Legal/AuthorizeAccessToContract', { contractId: ContractId, remoteId: RemoteId, authorize: Authorize });
    }
  }
};

export default AgentAPI;