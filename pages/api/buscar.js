async function buscar(request, response) {
  const pesquisa = request.query.produto || "arroz";
  const indice = [];

  function Adicionar(lista, nomeDaLoja) {
    indice.push({
      mercado: nomeDaLoja,
      produtos: lista,
    });
  }
  async function FortAtadista(nomeAPesquisar) {
    try {
      let listaDePrdutos = [];
      let result = await fetch(
        `https://www.deliveryfort.com.br/buscaautocomplete?maxRows=100&productNameContains=${nomeAPesquisar}`
      );
      let produtosJson = await result.json();
      for (var i = 0; i < produtosJson.itemsReturned.length; i++) {
        //TODO FAZER UMA PESQUISA POR CERVEJA SUB ZERO
        //if (i > 3) {
        let obj = produtosJson.itemsReturned[i].href.split("/");
        let result = await fetch(
          `https://www.deliveryfort.com.br/api/catalog_system/pub/products/search/${obj[3]}/p`
        );
        let produto = await result.json();
        if (produto[0] == undefined) {
          console.log("produto não encontrado");
        } else {
          listaDePrdutos.push({
            nome: produto[0].productName,
            preco:
              produto[0].items[0].sellers[0].commertialOffer.Installments[1]
                .Value,
            urlImg: produto[0].items[0].images[0].imageUrl,
          });
        }
      }
      Adicionar(listaDePrdutos, "Fort Atacadista");
    } catch (error) {
      console.log(error.message);
    }
  }
  async function Magia(autocomplete) {
    try {
      let listaDePrdutos = [];
      let result = await fetch(
        `https://b2c-sm-www-api-production4.sitemercado.com.br/api/v1/b2c/5553/product/load_search/${autocomplete}`,
        {
          credentials: "omit",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
            "sm-mmc": "2020.03.22-0",
            "sm-token":
              '{"Location":{"Latitude":-27.596019744873,"Longitude":-48.5562591552734,"Country":null,"CountryCode":null,"IP":null},"IdClientAddress":0,"IsDelivery":true,"IdLoja":5553,"IdRede":3107,"DateBuild":"2021-01-21T21:47:19.0647343","Version":"2019.07.24-0","CellPhoneModel":null,"AndroidVersion":null,"DeviceUUID":null}',
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
          referrer:
            "https://www.sitemercado.com.br/supermercadosmagia/florianopolis-loja-canasvieiras-canasvieiras-avenida-das-nacoes/busca/arroz",
          method: "GET",
          mode: "cors",
        }
      );
      let produtosJson = await result.json();
      for (var i = 0; i < produtosJson.products.length; i++) {
        let img = produtosJson.products[i].image.replace("//", "http://");
        listaDePrdutos.push({
          nome: produtosJson.products[i].excerpt,
          preco: produtosJson.products[i].prices[0].price,
          urlImg: img,
        });
      }

      Adicionar(listaDePrdutos, "Magia");
    } catch (error) {
      console.log(error.message);
    }
  }
  async function Angeloni(nomeAPesquisar) {
    try {
      let listaDePrdutos = [];
      let result = await fetch(
        `https://www.angeloni.com.br/super/autosuggest.json/browse?Dy=1&collection=/content/Web/super/AutoSuggest&Ntt=${nomeAPesquisar}*`
      );
      let produtosJson = await result.json();
      if (produtosJson.autoSuggest[0].dimensionSearchGroups[1] == undefined) {
        console.log("Não foi encontrado nada");
      } else {
        for (
          var i = 0;
          i <
          produtosJson.autoSuggest[0].dimensionSearchGroups[1]
            .dimensionSearchValues.length;
          i++
        ) {
          let prop = produtosJson.autoSuggest[0].dimensionSearchGroups[1].dimensionSearchValues[
            i
          ].properties.split(",");
          let price = prop[3].replace(" skuListPrice=R$ ", "");
          let img = prop[14].replace(" skuThumbnailUrl=//", "http://");
          listaDePrdutos.push({
            nome:
              produtosJson.autoSuggest[0].dimensionSearchGroups[1]
                .dimensionSearchValues[i].label,
            preco: parseFloat(price),
            urlImg: img,
          });
        }

        Adicionar(listaDePrdutos, "Angeloni");
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  async function Bistek(nomeAPesquisar) {
    try {
      let listaDePrdutos = [];
      let result = await fetch(
        `https://www.bistek.com.br/searchautocomplete/ajax/suggest/?q=${nomeAPesquisar}&store_id=2&cat=false&_=1611284495412`
      );
      let produtosJson = await result.json();
      for (var i = 0; i < produtosJson.indices[1].items.length; i++) {
        let aux = produtosJson.indices[1].items[i].price.split(
          'data-price-amount="'
        );
        let aux2 = aux[1].split('"',1);
        listaDePrdutos.push({
          nome: produtosJson.indices[1].items[i].name,
          preco: parseFloat(aux2[0]),
          urlImg: produtosJson.indices[1].items[i].image,
        });
      }
      Adicionar(listaDePrdutos, "Bistek");
    } catch (error) {
      console.log(error.message);
    }
  }
  await FortAtadista(pesquisa);
//  await Magia(pesquisa);
  await Angeloni(pesquisa);
  await Bistek(pesquisa);

  response.json({
    results: indice,
  });
}
export default buscar;
