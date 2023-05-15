var myTokenHeaders = new Headers();
myTokenHeaders.append("Authorization", "Basic SGFubmFoLkFsZW11OkVtZXJhbGRmbHky");

var requestOptions1 = {
  method: 'POST',
  headers: myTokenHeaders,
  redirect: 'follow'
};
const Token = fetch("https://learn.01founders.co/api/auth/signin", requestOptions1)
.then(response => response.text())
.catch(error => console.log('error', error));

(async() => {
var myQueryHeaders = new Headers();
myQueryHeaders.append("Content-Type", "application/json");
myQueryHeaders.append("Authorization", `Bearer ${(await Token).replaceAll('"', "")}`);

var graphql = JSON.stringify({
    query: `query { 
        userdata: user(where: {login: {_eq: \"Hannah.Alemu\"}}) {\n                login\n                id\n            }\n            progressByUser: progress(\n                where: {_and: [{user: {login: {_eq: \"Hannah.Alemu\"}}}, {object: {type: {_eq: \"project\"}}}, {isDone: {_eq: true}}, {grade: {_neq: 0}}]}\n                order_by: {updatedAt: asc}\n            ) {\n                id\n                grade\n                createdAt\n                updatedAt\n                object {\n                    id\n                    name\n                }\n            }\n            projectTransaction: transaction(\n                where: {_and: [{user: {login: {_eq: \"Hannah.Alemu\"}}}, {object: {type: {_eq: \"project\"}}}, {type: {_eq: \"xp\"}}]}\n                order_by: {amount: desc}\n            ) {\n                amount\n                createdAt\n                object {\n                    id\n                    name\n                }\n            }\n        }`,
        variables: {}
    })
    var requestOptions2 = {
        method: 'POST',
        headers: myQueryHeaders,
        body: graphql,
        redirect: 'follow'
    };
    

fetch("https://learn.01founders.co/api/graphql-engine/v1/graphql", requestOptions2)
  .then(response => response.json())
  .then(response => {console.log(response), createProfile(response)})
  .catch(error => console.log('error', error))
})();


 function createProfile(datas) {
    let user = datas.data.userdata
    let progressData = datas.data.progressByUser
    let best = 0
    for (let pro of progressData) {
        if (pro.grade>best) {
            best = pro.grade
        }
    }
    let projectData = datas.data.projectTransaction
    console.log("user", datas.data)
    let grade = 0
    for (let trans of projectData) {
        grade = grade + trans.amount
    }
   grade = Math.floor(grade/1000)
   let id = document.getElementById("id")
   id.innerHTML = "ID: " + user[0].id.toString()
   let xp = document.getElementById("xp")
   xp.innerHTML  = "Current XP: " + grade.toString() + "kB"
   let last = document.getElementById("lastSub")
   last.innerHTML = "Last Submitted Project: " + progressData[progressData.length-1].object.name
   let total = document.getElementById("compPro")
   total.innerHTML = "Completed Projects: " + projectData.length.toString()
   let bestG = document.getElementById("bestG")
   bestG.innerHTML = "Best Grade: " + best.toString()
    createProjects(progressData)
    createBar(projectData, progressData)
    createLine(progressData, projectData)
 }
 function createProjects(prog) {
    let table = document.getElementById("projectTable") 
    let len = prog.length
    let j = 0
    for (let i = len-4; i<len; i++) {
        let row = document.createElement("tr")
        let cell1 = document.createElement("td")
        cell1.innerHTML = prog[i].object.name
        row.append(cell1)
        let cell2 = document.createElement("td")
        var lDate = new Date(prog[i].createdAt).toLocaleDateString('en-UK')
        cell2.innerHTML = lDate
        row.append(cell2)
        table.append(row)
        let cell3 = document.createElement("td")
        var sDate = new Date(prog[i].updatedAt).toLocaleDateString('en-UK')
        cell3.innerHTML = sDate
        row.append(cell3)
        table.append(row)
        let cell4 = document.createElement("td")
        let fullgrade = prog[i].grade
        let grade = fullgrade.toFixed(1)
        cell4.innerHTML = grade
        row.append(cell4)
        j++
    }
 }

 //create bar chart of projects completed and xp amount in bottom right
 function createBar(proj, prog) {
    var barPadding = 5;
    var barWidth = (1/ 16)
    var svg = document.getElementById('bar-js');
    svg.setAttribute("width", "80%");
    svg.setAttribute("height", "80%");
    let count = 0
    for(var i = proj.length-1; i >= 0; i--){
        for (let j = 0; j<prog.length; j++ ) {
            let created = proj[i].createdAt
            //split at deciamal for short date
            let c = created.split(".")
            let updated = prog[j].updatedAt
            let dt = new Date(prog[j].updatedAt)
            let u = updated.split(".")
            if (c[0] == u[0]) {
                var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                var xLabel = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                var x2Label = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                //bar
                rect.setAttribute("y", svg.clientHeight - (proj[i].amount/1000)-10)
                rect.setAttribute("height", (proj[i].amount/1000)+10)
                console.log("bar graph y", svg.clientHeight )
                rect.setAttribute("width", (svg.clientWidth * barWidth)-barPadding)
                var translate = [svg.clientWidth * barWidth* count, 0]
                rect.setAttribute("transform", "translate("+ translate +")")
                rect.setAttribute("fill", "white")
                //x axis labels
                //XP
                xLabel.setAttribute("x", 15)
                xLabel.setAttribute("y", svg.clientHeight - (proj[i].amount/1000)-20)
                xLabel.setAttribute("width","100%");
                xLabel.setAttribute("height","auto");
                xLabel.setAttribute("font-size","12")
                xLabel.textContent = `${proj[j].amount/1000}kB`
                //Project Name
                x2Label.setAttribute("x", 15)
                x2Label.setAttribute("y", svg.clientHeight - (proj[i].amount/1000)-40)
                x2Label.textContent = `${proj[j].object.name}`;
                //append to graph
                x2Label.setAttribute("font-size","14")
                g.appendChild(rect)
                g.appendChild(xLabel)
                g.appendChild(x2Label)
                svg.appendChild(g)
                count++
            }
        }
    }

}
//create progresss line chart, date against project completed 
function createLine(prog, proj) {
    var svgWidth = 400, svgHeight = 200
    var svg = document.getElementsByClassName('line-js')[0];
    svg.setAttribute("class", "graph");
    // x-axis
        var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        g.setAttribute("class", "grid")
        var line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute("x1", 50)
        line.setAttribute("x2", svg.clientWidth-50)
         line.setAttribute("y1", svg.clientHeight-10)
        line.setAttribute("y2", svg.clientHeight-10)
         g.appendChild(line)
        svg.appendChild(g)
    // y-axis
        var line2 = document.createElementNS("http://www.w3.org/2000/svg", 'line')
        line2.setAttribute("x1", 50)
        line2.setAttribute("x2", 50)
         line2.setAttribute("y1", 20)
        line2.setAttribute("y2", svg.clientHeight-10)
         g.appendChild(line2)
        svg.appendChild(g)
    //graph points
        let startvalue = new Date(prog[0].updatedAt)
        let start = ((startvalue.getTime()-1600000000000)/100000000).toFixed(2)
        let scalar = (1-320.41/(svg.clientWidth-100)) +1
        console.log("scalar ", scalar)
     for ( let i = 0; i<prog.length; i++) {
        //x-value of point
        let inc;
        let dt = new Date(prog[i].updatedAt);
        if (i == 0) {
            inc = 50*scalar;
        } else {
        // divide by 1000000 to redeuce value size , take away 160000 as all values start with 16000, divide by 1000 to reduce size of incrementation
        let value = ((dt.getTime()-1600000000000)/100000000).toFixed(2);
         inc = (value - start)*scalar +50
        }
        console.log("increment", inc)
        //projectdata project transaction{amount:{}, createdAt: {}, object{id:{}, name:{}}
        let height
        for (let j = 0; j<proj.length; j++ ) {
            let created = proj[j].createdAt
            let c = created.split(".")
            let updated = prog[i].updatedAt
            let u = updated.split(".")
            //only count projects not audits, only include projects that are included in progress
            if (c[0] == u[0]) {
                //y-value of point
                height = (svg.clientHeight-10 - proj[j].amount/1000);
                console.log("height", height, "name", proj[j].object.name)
                var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                var circ = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                var xLabel = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                //point
                circ.setAttribute("cx", inc)
                circ.setAttribute("cy", height)
                circ.setAttribute("r", 4)
                circ.setAttribute("fill", "white")
                //data label
                text.setAttribute("x","0");
                text.setAttribute("y", 20);
                text.setAttribute("width","100%");
                text.setAttribute("height","auto");
                text.setAttribute("font-size","15");
                let points = (proj[j].amount/1000).toString() + "kB"
                text.textContent = `${proj[j].object.name}, ${points}`;
                // x-axis label
                xLabel.setAttribute("x", inc-15)
                xLabel.setAttribute("y", height-40)
                xLabel.setAttribute("width","100%");
                xLabel.setAttribute("height","auto");
                xLabel.setAttribute("font-size","13")
                xLabel.textContent = `${dt.toLocaleDateString()}`;
                g.appendChild(circ)
                g.appendChild(text)
                g.appendChild(xLabel)
                svg.appendChild(g)

            }
        }
    }
    


}

