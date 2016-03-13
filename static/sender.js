$(function(){
  var milkcocoa = new MilkCocoa('onilq0mtuc.mlkcca.com');
  var conection = milkcocoa.dataStore("conect");
  $("#YES").click(function(){
    conection.send({
      op:"YES"
    });
  });
  $("#NO").click(function(){
    conection.send({
      op:"NO"
    });
  });
});
