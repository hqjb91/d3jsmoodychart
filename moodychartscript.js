const svgHeight = 350;
const svgWidth = 350;
const margin = {top:20, right:20, bottom:50, left:50};
const height = svgHeight - margin.top - margin.bottom;
const width = svgWidth - margin.right - margin.left;
const relroughnesstoplot = [0.00001,0.00005,0.0001,0.0002,0.004,0.006,0.001,0.002,0.004,0.006,0.008,0.01,0.015,0.02,0.03,0.04,0.05]

document.addEventListener("DOMContentLoaded", function(event){
          drawChart();
});

function drawChart(){

    const svg = d3.select("#moodychart")
                    .append("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .append("g")  //helps center svg to show y axis
                    .attr("transform", "translate("+margin.left+","+margin.top+")");

    //Adding scales and axis (Log base 10 scale)
    const xscale = d3.scaleLog()
                        .base(10)
                        .range([0,width])
                        .domain([500,1e8]);

    const yscale = d3.scaleLog()
                        .base(10)
                        .range([height,0])
                        .domain([0.008,0.1]);

    const xaxis = d3.axisBottom().scale(xscale);
    const yaxis = d3.axisLeft().scale(yscale);

    //Adding axis labels
    svg.append("text")
        .attr("transform","translate("+width/2+","+(height+margin.top+20)+")")
        .attr("text-anchor","middle")
        .text("Reynolds Number");

    svg.append("text")
        .attr("transform","translate(-40,"+height/2+")rotate(-90)")
        .attr("text-anchor","middle")
        .text("Coefficient of friction")

    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate(0,"+height+")")
        .call(xaxis);

    svg.append("g")
        .attr("class","axis")
        .call(yaxis);
        
    //Plotting the laminar lines
    var laminarline = d3.line()
                        .x(function(d){
                            return xscale(d.x);
                        })
                        .y(function(d) {return yscale(d.y);});

    svg.append("path")
        .datum([{x:2300, y:0.027826087},{x:640,y:0.1}]) //64/2300=0.027826087
        .attr("class","laminarline")
        .attr("d",laminarline);

    //Plotting the turbulent lines
    function drawturbulentline(relroughness){

        var turbulentline = d3.line()
                                .x(function(d){return xscale(d.x)})
                                .y(function(d){return yscale(colebrookEqnRR(d.x,relroughness))})
                                .curve(d3.curveMonotoneX);
        svg.append("path")
            .datum(tb)
            .attr("class","turbulentline")
            .attr("d",turbulentline)
            .attr("id","TURBline"+relroughness);

        svg.append("text")
            .append("textPath") //append a textPath to the text element
             .attr("xlink:href", "#TURBline"+relroughness) //place the ID of the path here
             .style("text-anchor","start") 
             .attr("font-size","9")
             .attr("startOffset", "81%")
             .text(relroughness);
    }

    relroughnesstoplot.forEach(function plotline(value){
        drawturbulentline(value);
    });

/*
    svg.selectAll("dot")
    .data([{x:2000,y:0.01}])
    .enter()
    .append("circle")
    .attr("cx", function(d){
        console.log(xscale(d.x)) 
        return xscale(d.x);
    })
    .attr("cy", function(d) {return yscale(d.y);})
    .attr("r", 3)
    .style("fill", "magenta");  
*/

}

function colebrookFunc(f,re,k,d){
   return 1/Math.pow((-2*Math.log10((2.51/(re*Math.sqrt(f))) + (k/d)/(3.72) )),2);
}

//Fixed point iteration
function colebrookEqn(reynoldsnum,k,d){
    let darcyff0 = 0.008;
    let count = 1;
    let error = 1.0;

    while (error > 1e-7 && count < 10000){

        darcyff = colebrookFunc(darcyff0,reynoldsnum,k,d);
        error = Math.abs((darcyff - darcyff0)/Math.abs(darcyff));
        darcyff0 = darcyff;

        count++;
    }

    return darcyff;
}

function colebrookFuncRR(f,re,relroughness){
    return 1/Math.pow((-2*Math.log10((2.51/(re*Math.sqrt(f))) + (relroughness)/(3.72) )),2);
 }
 
 //Fixed point iteration
 function colebrookEqnRR(reynoldsnum,relroughness){
     let darcyff0 = 0.008;
     let count = 1;
     let error = 1.0;
 
     while (error > 1e-5 && count < 10000){
 
         darcyff = colebrookFuncRR(darcyff0,reynoldsnum,relroughness);
         error = Math.abs((darcyff - darcyff0)/Math.abs(darcyff));
         darcyff0 = darcyff;
 
         count++;
     }

     return darcyff;
 }

function clearCalc(){
    document.getElementById("reynoldsnum").value = "";    
    document.getElementById("hydraulicdiameter").value = "";  
    document.getElementById("absroughness").value = "";  
                
    document.getElementById("frictionfactor").value = "";  
    document.getElementById("relroughness").value = "";     
}

function plotPoint(reynum,relrough){

    const svg = d3.select("#moodychart")
                    .select("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .append("g")  //helps center svg to show y axis
                    .attr("transform", "translate("+margin.left+","+margin.top+")");
   
    const xscale = d3.scaleLog()
                    .base(10)
                    .range([0,width])
                    .domain([500,1e8]);

    const yscale = d3.scaleLog()
                    .base(10)
                    .range([height,0])
                    .domain([0.008,0.1]);


    svg.selectAll("dot")
    .data([{x:reynum,y:relrough}])
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        console.log("test");
        return xscale(d.x);})
    .attr("cy", function(d) {return yscale(d.y);})
    .attr("r", 3)
    .style("fill", "magenta");  
    
}

function moodyCalc(){

    if(isNaN(document.getElementById("reynoldsnum").value) && isNaN(document.getElementById("hydraulicdiameter").value) && isNaN(document.getElementById("absroughness").value)){
        alert("Please Enter a Number for the Inputs");
    } else if(document.getElementById("reynoldsnum").value < 4000){
        alert("Colebrook Equation works for Re > 4000, for Re < 2300 just use f=64/Re")
    } else {
        reynum = parseFloat(document.getElementById("reynoldsnum").value);
        hdia = parseFloat(document.getElementById("hydraulicdiameter").value);
        absr = parseFloat(document.getElementById("absroughness").value);

        fricf = colebrookEqn(reynum,absr,hdia);
        relr = absr/hdia;
    }

    plotPoint(reynum,fricf);

    //Rounding to decimal places
    document.getElementById("reynoldsnum").value = Math.round(reynum);    
    document.getElementById("hydraulicdiameter").value = Math.round(hdia*10000)/10000;  
    document.getElementById("absroughness").value = Math.round(absr*10000)/10000;  
                
    document.getElementById("frictionfactor").value = Math.round(fricf*10000)/10000;  
    document.getElementById("relroughness").value = Math.round(relr*100000)/100000;  
}