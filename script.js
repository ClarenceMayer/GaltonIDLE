	window.onresize = setElementSize;
	window.onload=function(){
		GaltonSave = getCookie("GaltonSave");
		loadSave(GaltonSave);
		canvas = document.getElementById("canvas");
		ctx = canvas.getContext("2d");
		canvas.addEventListener("click",click);
		setElementSize();
		setEvents();
		//40 frames par secondes
		setInterval(loop,1000/40);

		//Save every minute
		setInterval(save,60*1000);
	}

	

	nbLigne = 10;
	nbCol = 10;
	goalHeight = 50,"H";
	xinterval = canvas.width/nbCol;
	yinterval = canvas.height/nbLigne;
	dotRadius = 15,"L";
	coinRadius = 7,"L";
	buyNb = 1;
	autoScaling = 1.2;
	goalScaling = 1.5;
	
	//[x,y,vx,vy,color]
	coin = new Array();
	//[x,y]
	dot = new Array();

	for(i = 1; i < nbLigne; i++){
		if(i%2 == 0){
			for(j = 0; j<nbCol+1; j++){
				dot.push([j*xinterval,i*yinterval - 20]);
			}
		}else{
			for(j = 0; j<nbCol; j++){
				dot.push([j*xinterval + xinterval/2,i*yinterval - 20]);
			}
		}
		
	}

	function loop(){
		ctx.fillStyle = "white";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		setLabels();
		for(i=0;i<nbCol+1;i++){
			if(i%2==0){
				ctx.fillStyle = "#42adf5";
			}else{
				ctx.fillStyle = "#fff673";
			}
			ctx.fillRect(getResponsiveSizeCanvas(i*xinterval,"L"),canvas.height-getResponsiveSizeCanvas(goalHeight,"H"),getResponsiveSizeCanvas(xinterval,"L"),getResponsiveSizeCanvas(goalHeight,"H"));	
			ctx.fillStyle = "black";
			ctx.font = "15px Arial"
			ctx.fillText(goalValue[i],getResponsiveSizeCanvas(i*xinterval+xinterval/2,"L"),canvas.height-getResponsiveSizeCanvas(goalHeight,"H")/2)
			ctx.lineWidth=3;
			ctx.beginPath()
			ctx.moveTo(getResponsiveSizeCanvas(i*xinterval,"L"),canvas.height-getResponsiveSizeCanvas(goalHeight,"H"));
			ctx.lineTo(getResponsiveSizeCanvas(i*xinterval,"L"),canvas.height);
			ctx.stroke();
		}

		for(i= 0; i<coin.length; i++){
			ctx.beginPath();
			ctx.arc(getResponsiveSizeCanvas(coin[i][0],"L"),getResponsiveSizeCanvas(coin[i][1],"H"),getResponsiveSizeCanvas(coinRadius,"L"),0,2*Math.PI,false);
			ctx.fillStyle = coin[i][4];
			ctx.fill();

			for(j = 0; j<dot.length; j++){
				if(Math.sqrt(Math.pow(getResponsiveSizeCanvas(coin[i][0],"L")-getResponsiveSizeCanvas(dot[j][0],"L"),2)+Math.pow(getResponsiveSizeCanvas(coin[i][1],"H")-getResponsiveSizeCanvas(dot[j][1],"H"),2))<getResponsiveSizeCanvas(dotRadius,"L") + getResponsiveSizeCanvas(coinRadius,"L")){
					coin[i][2] = (coin[i][0]-dot[j][0])/2;
					coin[i][3] = (coin[i][1]-dot[j][1])/2;
					if(coin[i][2] == 0){
						if(Math.random()*100>50){
							coin[i][2] = 2;
						}else{
							coin[i][2] = -2;
						}
					}
				}
			}

			/*for(j=0;j<nbCol+1;j++){
				if(coin[i][1]>canvas.height-goalHeight && Math.abs(coin[i][0]-j*xinterval)<coinRadius){
					coin[i][2] = -coin[i][2];
				}
			}*/
			
			if(getResponsiveSizeCanvas(coin[i][0],"L") <= getResponsiveSizeCanvas(coinRadius,"L") ){
				coin[i][2] = Math.abs(-coin[i][2]);
			}else if(getResponsiveSizeCanvas(coin[i][0],"L") >= canvas.width-getResponsiveSizeCanvas(coinRadius,"L")){
				coin[i][2] = -Math.abs(-coin[i][2]);
			}			

			coin[i][3] += 1.1;
			
			coin[i][0] += coin[i][2];
			coin[i][1] += coin[i][3];

			if(getResponsiveSizeCanvas(coin[i][1],"H")>canvas.height){
				tmp = score;
				score += goalValue[Math.floor(coin[i][0]/xinterval)];
				if(isNaN(score)){
					score = tmp;
				}
				coin.splice(i,1);
				i--;
			}
		}

		for(i = 0; i<dot.length; i++){
			ctx.beginPath();
			ctx.arc(getResponsiveSizeCanvas(dot[i][0],"L"),getResponsiveSizeCanvas(dot[i][1],"H"),getResponsiveSizeCanvas(dotRadius,"L"),0,2*Math.PI,false);
			ctx.fillStyle = "#48494a";
			ctx.fill();
		}
	}

	function buy(event){
		id = event.target.value;
		curPrix = getPrix(auto[id][0])
		if(curPrix<=score){
			if(buyNb=="Max"){
				tmpBuyNb = getMaxBuyNB(auto[id][0],autoScaling);
				score -= curPrix;
				auto[id][2] += parseInt(tmpBuyNb);
				auto[id][0] = Math.ceil(auto[id][0]*Math.pow(autoScaling,tmpBuyNb));
			}else{
				score -= curPrix;
				auto[id][0] = Math.ceil(auto[id][0]*Math.pow(autoScaling,buyNb));
				auto[id][2] += parseInt(buyNb);
			}
			if(auto[id][3]){
				clearInterval(auto[id][3]);
			}
			auto[id][3] = true;
			auto[id][3] = setInterval(autoSpawn,1000/(auto[id][1]*auto[id][2]));
		}
	}

	function upGoal(event){
		id = event.target.value;
		if(getPrix(goalUpPrice[id])<=score){
			
			if(buyNb=="Max"){
				tmpBuyNb = getMaxBuyNB(goalUpPrice[id],goalScaling);
				score -= getPrix(goalUpPrice[id]);
				goalValue[id] += parseInt(tmpBuyNb);
				goalUpPrice[id] = Math.ceil(goalUpPrice[id]*Math.pow(goalScaling,tmpBuyNb));
			}else{
				score -= getPrix(goalUpPrice[id]);
				goalValue[id]+= parseInt(buyNb);
				goalUpPrice[id] = Math.ceil(goalUpPrice[id]*Math.pow(goalScaling,buyNb));
			}
		}
	}

	function click(event){
		ratio = 800/canvas.width;
		newCoin(ratio * event.clientX);
	}

	function autoSpawn(){
		newCoin(Math.random()*800);
	}

	function newCoin(x,y=5, vx=0, vy=0){
		color = "rgb("+ Math.random()*250 +","+ Math.random()*250 +","+ Math.random()*250 +")";
		coin.push([x,y,vx,vy,color]);
	}

	function save(){
		setCookie("GaltonSave",getSaveFile(),365);
	}

	function exportSave(){
		var element = document.createElement('a');
	    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(getSaveFile()));
	    element.setAttribute('download', "GaltonSave.txt");
	    element.style.display = 'none';
	    document.body.appendChild(element);
	    element.click();
	    document.body.removeChild(element);
	}

	function importSave(){
		importedSave = document.getElementById("importInput").value;
		if(importedSave != ""){
			loadSave(importedSave);
		}
		document.getElementById("importInput").value = "";
	}

	function getSaveFile(){
		save = JSON.stringify({score,auto,goalValue,goalUpPrice});
		save = utf8_to_b64(save);
		return save;
	}

	function loadSave(GaltonSave){
		if(GaltonSave != ""){
			parsedJSON = JSON.parse( b64_to_utf8(GaltonSave));
			score = parsedJSON["score"];
			goalValue = parsedJSON["goalValue"];
			goalUpPrice = parsedJSON["goalUpPrice"];
			auto = parsedJSON["auto"];
			for(i=0;i<auto.length;i++){
				if(auto[i][2]>0){
					clearInterval(auto[i][3]);
					auto[i][3] = true;
					auto[i][3] = setInterval(autoSpawn,1000/(auto[i][1]*auto[i][2]));
				}
			}
		}else{
			score = 0;
			goalValue = [1,1,1,1,1,1,1,1,1,1];
			goalUpPrice = [50,50,50,50,50,50,50,50,50,50];
			//[prix,tirPerSec,nombre,IntervalManager]
			auto = [[10,0.1,0,false],[50,1/7,0,false],[150,0.2,0,false],[400,1/3,0,false],[1500,1,0,false],[5000,2,0,false]];
		}
		setLabels();
	}

	

	function getTirPerSecTotal(){
		sum = 0;
		for(i=0;i<auto.length;i++){
			sum += auto[i][1]*auto[i][2];
		}
		return sum;
	}

	function getPrix(prixUnit){
		switch(buyNb){
			case 1:
				return prixUnit;
			break;
			case "Max":
				j=1;
				prix = prixUnit;
				prevPrix = prix
				while(prix<=score){
					prevPrix = prix;
					j++;
					prix = Math.ceil(prixUnit * ((1-Math.pow(autoScaling,j))/(1-autoScaling)));
				}
				return prevPrix;
			break;
			default:
				return Math.ceil(prixUnit * ((1-Math.pow(autoScaling,buyNb))/(1-autoScaling)));
			break;
		}
	}

	function getMaxBuyNB(prixUnit,scaling){
		j=1;
		prix = prixUnit;
		prevJ = j;
		while(prix<=score){
			prevJ = j;
			j++;
			prix = Math.ceil(prixUnit * ((1-Math.pow(scaling,j))/(1-scaling)));
		}
		return prevJ;
	}

	function setLabels(){
		document.getElementById("score").innerHTML = display(score);
		autos = document.getElementsByClassName("autoDiv");
		for(i=0;i<autos.length;i++){
			curPrix = getPrix(auto[i][0]);
			autos[i].getElementsByClassName("prix")[0].innerHTML = display(curPrix);
			document.getElementById("count"+i).innerHTML = "lvl "+ display(auto[i][2]);
			if(buyNb!="Max"){
				autos[i].getElementsByClassName("nombre")[0].innerHTML = "x"+buyNb;
			}else{
				autos[i].getElementsByClassName("nombre")[0].innerHTML = "x"+ getMaxBuyNB(auto[i][0],autoScaling);
			}
			if(curPrix>score){
				autos[i].getElementsByTagName("button")[0].classList.remove("available");
				autos[i].getElementsByTagName("button")[0].classList.add("disable");		
			}else{
				autos[i].getElementsByTagName("button")[0].classList.add("available");
				autos[i].getElementsByTagName("button")[0].classList.remove("disable");
			}
			
		}
		upGoalDiv = document.getElementsByClassName("upGoalDiv");
		for(i=0;i<upGoalDiv.length;i++){
			curPrix = getPrix(goalUpPrice[i]);
			upGoalDiv[i].getElementsByClassName("prix")[0].innerHTML = display(curPrix);
			if(buyNb!="Max"){
				upGoalDiv[i].getElementsByClassName("nombre")[0].innerHTML = "x" + buyNb;
			}else{
				upGoalDiv[i].getElementsByClassName("nombre")[0].innerHTML = "x" + getMaxBuyNB(goalUpPrice[i],goalScaling);
			}
			if(curPrix>score){
				upGoalDiv[i].getElementsByTagName("button")[0].classList.remove("available");
				upGoalDiv[i].getElementsByTagName("button")[0].classList.add("disable");		
			}else{
				upGoalDiv[i].getElementsByTagName("button")[0].classList.add("available");
				upGoalDiv[i].getElementsByTagName("button")[0].classList.remove("disable");
			}

		}
	}

	function display(num){
		num = num.toString().split('');
		tmp = new Array();
		for(j=1;j<=num.length;j++){
			tmp.push(num[num.length-j]);
			if(j%3==0){
				tmp.push(" ");
			}
		}
		tmp.reverse();
		return tmp.join("");
	}

	function setEvents(){
		document.getElementById("save").addEventListener("click",save);
		document.getElementById("export").addEventListener("click",exportSave);
		document.getElementById("import").addEventListener("click",importSave);
		buyNbButtons = document.getElementsByClassName("nbBuyButton");
		for(i=0;i<buyNbButtons.length;i++){
			buyNbButtons[i].addEventListener("click",(event)=>{
				document.getElementById("buy"+buyNb).classList.remove("selected");
				buyNb = event.target.value;
				document.getElementById("buy"+buyNb).classList.add("selected");
			})
		}
		autos = document.getElementsByClassName("autoDiv");
		for(i=0;i<autos.length;i++){
			autos[i].getElementsByTagName("button")[0].addEventListener("click",buy);
		}
		upGoalDiv = document.getElementsByClassName("upGoalDiv");
		for(i=0;i<upGoalDiv.length;i++){
			upGoalDiv[i].getElementsByTagName("button")[0].addEventListener("click",upGoal);
		}
	}

	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires+";";
	}

	function getCookie(cname) 
	{
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++)
		{
		    var c = ca[i];
		    while (c.charAt(0) == ' ') {
		      c = c.substring(1);
		    }
		    if (c.indexOf(name) == 0) {
		      return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	function utf8_to_b64( str ) {
	  return window.btoa(unescape(encodeURIComponent( str )));
	}

	function b64_to_utf8( str ) {
	  return decodeURIComponent(escape(window.atob( str )));
	}

	function setElementSize(){
		canvas.height = (window.innerHeight*840)/937;
		canvas.width = canvas.height -40;
		document.getElementById("leftDiv").style.width = canvas.width;
	}

	//orientation : H = hauteur / L = largeur
	function getResponsiveSizeCanvas(taille,orientation){
		return orientation=="H"?(canvas.height*taille)/840:(canvas.width*taille)/800;
	}
