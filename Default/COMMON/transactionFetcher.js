sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
  ],
  function (
    JSONModel,
  ) {
    "use strict";
    /* 2022 Tayyib Bayram: Primary used for sending large data that transactioncaller can't send due to max limit. Also added formatting for model because it is nearly always used with transaction.  */
    return {
      /**
       * The function that calls this function must be async function and you must put 'await' before calling this
       * example 
       * myFunc: async function(){ do stuff...; const response = await syncFetch(); do other stuff...; } 
       * @param {string} transactionPath Default/MES/tayyib/T_TEST
       * @param {object} parameters {key: value}
       * @param {string} output O_JSON
       * @param {'GET' | 'POST'} method 
       * @returns promise
       */
      syncFetch: async function (transactionPath, parameters, output, method = "GET") {
        if (method == 'GET') {
          return await this._fetchGETSync(transactionPath, parameters, output);
        }
        else if (method == 'POST') {
          return await this._fetchPOSTSync(transactionPath, parameters, output);
        }
      },
      sync: async function (transactionPath, parameters, output, method = "GET") {
        return await this.syncFetch(transactionPath, parameters, output, method);
      },

      _fetchGETSync: async function (transactionPath, parameters, output) {
        const url = this._createURL(transactionPath, parameters, output);
        let response = await fetch(url, {
          method: "GET",
          keepalive: false,
        }).catch(error => {
          console.error('Transaction: ' + transactionPath + ' error: ' + error);
          return null;
        });
        return await this._syncResponseHandler(response, transactionPath, output);
      },

      _fetchPOSTSync: async function (transactionPath, parameters, output) {
        const url = this._createURL(transactionPath, {}, output);
        const urlParameters = new URLSearchParams();
        for (const parameter in parameters) {
          urlParameters.append(parameter, parameters[parameter]);
        }
        let response = await fetch(url, {
          method: "POST", // POST, PUT, DELETE, etc.
          body: urlParameters.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          keepalive: false,
        }).catch(error => {
          console.error('Transaction: ' + transactionPath + ' error: ' + error);
          return null;
        });
        return await this._syncResponseHandler(response, transactionPath, output);
      },

      _syncResponseHandler: async function (response, transactionPath, output) {
        if (response == null) return [null, 'E'];
        try {
          if (!response.ok) throw (response.status + ' ' + response.statusText);
          response = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(response, "application/xml");
          response = this._convertXMLResponseToJSON(xml, output);
        } catch (error) {
          response = [null, 'E'];
          console.error('Transaction: ' + transactionPath + ' error: ' + error);
        }
        return response;
      },


      /**
       * 
      * @param {string} transactionPath Default/MES/tayyib/T_TEST
       * @param {object} parameters {key: value}
       * @param {string} output O_JSON
       * @param {Function} callbackFunction 
       * @param {*} that this 
       * @param {'GET' | 'POST'} method 
       * @param {object} callbackParameters  {key: value}
       */
      asyncFetch: async function (transactionPath, parameters, output, callbackFunction, that, method = "GET", callbackParameters) {
        if (method == 'GET') {
          this._fetchGET(transactionPath, parameters, output, callbackFunction, that, callbackParameters);
        }
        else if (method == 'POST') {
          this._fetchPOST(transactionPath, parameters, output, callbackFunction, that, callbackParameters);
        }
      },
      async: async function (transactionPath, parameters, output, callbackFunction, that, method = "GET", callbackParameters) {
        this.asyncFetch(transactionPath, parameters, output, callbackFunction, that, method, callbackParameters)
      },

      _fetchGET: async function (transactionPath, parameters, output, callbackFunction, that, callbackParameters) {
        const thiss = this;
        const url = this._createURL(transactionPath, parameters, output);
        fetch(url, {
          method: "GET",
          keepalive: false,
        })
          .then(response => {
            if (!response.ok) throw (response.status + ' ' + response.statusText);
            return response.text();
          })
          .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const response = thiss._convertXMLResponseToJSON(xml, output);
            return response;
          })
          .catch(error => {
            console.error('Transaction: ' + transactionPath + ' error: ' + error);
            return ["Non-Transaction Error: " + error, 'E'];
          })
          .then(response => {
            callbackFunction(response, that, callbackParameters);
          });
      },

      _fetchPOST: async function (transactionPath, parameters, output, callbackFunction, that, callbackParameters) {
        const thiss = this;
        const url = this._createURL(transactionPath, {}, output);
        const urlParameters = new URLSearchParams();
        for (const parameter in parameters) {
          urlParameters.append(parameter, parameters[parameter]);
        }
        fetch(url, {
          method: "POST", // POST, PUT, DELETE, etc.
          body: urlParameters.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          keepalive: false,
        })
          .then(response => {
            if (!response.ok) throw (response.status + ' ' + response.statusText);
            return response.text();
          })
          .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const response = thiss._convertXMLResponseToJSON(xml, output);
            return response;
          })
          .catch(error => {
            console.error('Transaction: ' + transactionPath + ' error: ' + error);
            return ["Non-Transaction Error: " + error, 'E'];
          })
          .then(response => {
            callbackFunction(response, that, callbackParameters);
          });
      },

      /**
       * Fetches a file 
       * @param {string} filePath  like ./model/screenInfos.json
       * @param {Function} callbackFunction 
       * @param {*} that view
       * @param {object} callbackParameters 
       * @param {string} type blob | json | text | other | image | xml
       */
      asyncFetchFile: async function (filePath, callbackFunction, that, callbackParameters, type = 'other') {
        type = type.toLowerCase();
        fetch(filePath, {
          method: "GET",
          keepalive: false,
        })
          .then(response => {
            if (!response.ok) throw (response.status + ' ' + response.statusText);
            if (type == 'blob' || type == 'image')
              return response.blob();
            else if (type == 'json')
              return response.json();
            else if (type == 'text' || type == 'xml')
              return response.text();
            else
              return response;
          })
          .then(data => {
            const response = [data, 'S'];
            if (type == 'image')
              response[2] = window.URL.createObjectURL(data);
            if (type == 'xml') {
              const parser = new DOMParser();
              response[0] = parser.parseFromString(data, "application/xml");
            }
            return response;
          })
          .catch(error => {
            console.error('error: ' + error);
            return ["error: " + error, 'E'];
          })
          .then(response => {
            callbackFunction(response, that, callbackParameters);
          });
      },
      asyncFile: async function (filePath, callbackFunction, that, callbackParameters, type = 'other') {
        this.asyncFetchFile(filePath, callbackFunction, that, callbackParameters, type)
      },


      /**
       * @private
       * @param {string} transactionPath Default/MES/tayyib/T_TEST
       * @param {object} parameters {key: value}
       * @param {string} output 'O_JSON'
       * @returns {string} url
       */
      _createURL: function (transactionPath, parameters, output = 'O_JSON') {
        let cURL = "/XMII/Runner?";
        for (const key in parameters) {
          const value = parameters[key];
          cURL = cURL + "&" + key + "=" + value;
        }
        cURL = cURL + '&Transaction=' + transactionPath;
        cURL = cURL + '&OutputParameter=' + output;
        return cURL;
      },

      /**
       * @private
       * @param {object} responseXML document xml
       * @param {string} output 'O_JSON'
       * @returns [Rowsets..., string]
       */
      _convertXMLResponseToJSON: function (responseXML, output) {
        const responseObject = [];
        const errorNode = responseXML.getElementsByTagName("FatalError");
        if (errorNode.length > 0) {
          responseObject[0] = errorNode[0].innerHTML.toString();
          responseObject[1] = "E";
        } else {
          responseObject[1] = "S";
          const outputData = responseXML.getElementsByTagName(output)[0]?.innerHTML;
          if (outputData) {
            try {
              responseObject[0] = JSON.parse(outputData);
            }
            catch (error) {
              responseObject[0] = outputData;
            }
          }
          else {
            responseObject[0] = '';
          }
        }
        return responseObject;
      },

      /**
       * Only takes Rowsets.Rowset.Row[] datas 
       * @param {object} data is JSON file returned from fetch [Rowsets..., string]
       * @returns {JSONModel} JSONMODEL
       */
      formatJSONModel: function (data) {
        const myModel = new JSONModel();
        if (!data[0]?.Rowsets?.Rowset?.Row) {
          myModel.setData(null);
        }
        else if (Array.isArray(data[0].Rowsets?.Rowset?.Row)) {
          myModel.setData(data[0].Rowsets.Rowset.Row);
        } else {
          let objData = data[0];
          const dummyData = [];
          dummyData.push(data[0].Rowsets.Rowset.Row);
          objData = dummyData;
          myModel.setData(objData);
        }
        return myModel;
      },

      /**
       * 
       * @param {object} data is JSON file returned from fetch [Rowsets..., string]
       * @returns {JSONModel} JSONMODEL
       */
      formatJSONModelRaw: function (data) {
        const myModel = new JSONModel();
        if (Array.isArray(data[0].Rowsets?.Rowset?.Row)) {
          myModel.setData(data[0]);
        } else if (!data[0].Rowsets?.Rowset?.Row) {
          myModel.setData(null);
        } else {
          let objData = data[0];
          const dummyData = [];
          dummyData.push(data[0].Rowsets.Rowset.Row);
          objData.Rowsets.Rowset.Row = dummyData;
          myModel.setData(objData);
        }
        return myModel;
      },


      /**
       * 
       * @param {object} data is JSON file with arrays
       * @returns {JSONModel} JSONMODEL
       */
      formatJSONModelUni: function (data) {
        const myModel = new JSONModel();
        if (Array.isArray(data)) {
          myModel.setData(data);
        } else if (!data) {
          myModel.setData(null);
        } else {
          let objData = data;
          const dummyData = [];
          dummyData.push(data);
          objData = dummyData;
          myModel.setData(objData);
        }
        return myModel;
      },

      /**
       * Converts image to base64 format
       * @param {string} url 
       * @param {object} this 
       * @param {Function} callback 
       */
      /* toDataURL: function (url, that, callback) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          const reader = new FileReader();
          reader.onloadend = function () {
            callback(reader.result, that);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();


      }, */

      /**
       * Converts image to base64 format
       * for sync dont give that or callback parameter and just do await 
       * @param {string} url 
       * @param {Function} callback 
       * @param {object} this 
       */
      toDataURL: async function (url, callback, that) {
        const data = await fetch(url)
          .then(response => response.blob());

        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(data)
        });
        if (callback)
          callback(base64, that);
        return base64;
      },


      /**
       * 
       * @param {Document} document 
       * @param {string} mainTag  = 'Rowset'
       * @returns 
       */
      xml2Json: function (document, mainTag = 'Rowset') {
        let mainJSON = {};
        if (document.getElementsByTagName(mainTag)?.length == 0) return {};
        deep(document.getElementsByTagName(mainTag)[0], mainJSON)
        function deep(xml, json) {
          const name = xml.localName || xml.nodeName || xml.tagName;
          if (!json) json = {};
          json[name] = {};

          if (xml.children.length == 0) {
            json[name] = xml.innerHTML;
            if (xml.attributes.length != 0) {
              json[name] = { value: json[name] }
              json[name]['attributes'] = {};
              for (const attribute of xml.attributes) {
                const aName = attribute.localName || attribute.nodeName || attribute.tagName;
                json[name]['attributes'][aName] = attribute.value || attribute.nodeValue;
              }
            }
          }
          else {
            for (const child of xml.children) {
              let childValue = json[name][child.nodeName]
              if (!childValue) {
                deep(child, json[name])
              }
              else if (childValue && Array.isArray(json[name][child.nodeName])) {
                json[name][child.nodeName].push(deep(child)[child.nodeName])
              }
              else if (childValue) {
                json[name][child.nodeName] = [
                  json[name][child.nodeName]
                ]
                json[name][child.nodeName].push(deep(child)[child.nodeName])
              }
            }
          }
          return json;
        };
        return mainJSON;
      }

    }
  });
