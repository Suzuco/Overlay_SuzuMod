
const boxDpsHTML = `
<div class="lightbar"></div>
<div class="nameplate">{icon}<span class="name">{name}</span></div>
<div class="dps">{encdps} ({damage%})</div>
<div class="crdh">{crithit%}! {DirectHitPct}+ {CritDirectHitPct}!! {deaths}d</div>
`;

const boxHpsHTML = `
<div id="hpsbar" style="">{name} {effhps} ({enchps} -{OverHealPct})</div>
<div class="lightbar"></div>
`;

let combatants = [];
let totalHPS = 0.0;
// Statistics for Average DPS and Total HPS
function suzuMod(data) {
    let dpsList = [];
    duration = data.Encounter.DURATION;
    totalHPS = 0.0;
    for (let combatantName in data.Combatant){
        let combatant = data.Combatant[combatantName];
        if (isNaN(combatant["enchps"])) {
            combatant["effhps"] = "---";
        }
        else {
            let effhps = parseFloat(combatant["enchps"]) * (1.0 - parseFloat(combatant["OverHealPct"].slice(0, -1)) / 100);
            combatant["effhps"] = effhps.toFixed(2).toString();
            totalHPS += effhps;
        }

        if (roleDPSes.indexOf(combatant["Job"]) > -1) {
            dpsList.push(parseFloat(combatant["encdps"]));
        }
    }
    if (dpsList.length >= 1) {
        dpsAverage = dpsList.reduce((i, j) => {return i + j; }) / dpsList.length;
    } else {
        dpsAverage = 0;
    }
    dpsAverage = dpsAverage.toFixed(2);
}

// Update encounter title
function updateEncounter(data) {
    let encounterElem = document.getElementById('encounter');
    encounterElem.innerText = parseActFormat(encounterTitle, data.Encounter);
}

function updateCombatantList(data) {
    let tableD = document.getElementById("table_d");
    let tableH = document.getElementById("table_h");
    let tbodyDOld = tableD.tBodies.namedItem('tableBody_d');
    let tbodyHOld = tableH.tBodies.namedItem('tableBody_h');
    let tbodyDNew = document.createElement('tbody');
    let tbodyHNew = document.createElement('tbody');
    tbodyDNew.id = 'tableBody_d';
    tbodyHNew.id = 'tableBody_h';

    let tRowDps = tbodyDNew.insertRow(0);
    let tRowHps = tbodyHNew.insertRow(0);
    let combatantIdx = 0;
    let healerIdx = 0;
    for (let combatant_name in data.Combatant)
    {
        // DPS bar
        let combatant = data.Combatant[combatant_name];
        let boxCell = tRowDps.insertCell(combatantIdx);
        boxCell.innerHTML = parseActFormat(boxDpsHTML, combatant);
        boxCell.style.width = combatant["damage%"];

        let lightBar = boxCell.getElementsByClassName("lightbar")[0];
        lightBar.style.backgroundColor = lightBarColors[combatantIdx % 8];
        lightBar.style.boxShadow = "0 2px 4px " + lightBarColors[combatantIdx % 8];

        if (combatant_name == "YOU") {
            boxCell.style.backgroundImage = "linear-gradient(rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0))";
        }

        let nametag = boxCell.getElementsByClassName("name")[0];
        if (combatant['deaths'] > 0) {
            nametag.style.color = "#FFA0A0";
            nametag.style.textShadow = "-1px 0 3px #802020, 0 1px 3px #802020, 1px 0 3px #802020, 0 -1px 3px #802020";
        }
        ++combatantIdx;

        let dpsMeter = boxCell.getElementsByClassName('dps')[0];
        if ((dpsAverage > 0) && (duration > config.duration)) {
            if ((combatant["encdps"] < dpsAverage * config.dpsLower / 100) && roleDPSes.indexOf(combatant["Job"]) > -1) {
                    // colorRed
                    dpsMeter.style.color = "#FFA0A0";
                    dpsMeter.style.textShadow = "-1px 0 3px #802020, 0 1px 3px #802020, 1px 0 3px #802020, 0 -1px 3px #802020";
                }

                // T+H
                if ((combatant["encdps"] >= dpsAverage * config.dpsTank / 100 && roleTanks.indexOf(combatant["Job"]) > -1) ||
                     (combatant["encdps"] >= dpsAverage * config.dpsHealer / 100 && roleHealers.indexOf(combatant["Job"]) > -1)) {
                    // colorPurple
                    dpsMeter.style.color = "#EE82EE";
                    dpsMeter.style.textShadow = "-1px 0 3px #8A2BE2, 0 1px 3px #8A2BE2, 1px 0 3px #8A2BE2, 0 -1px 3px #8A2BE2";
                }

                // Common
                if (combatant["encdps"] >= dpsAverage * config.dpsUpper / 100) {
                    // colorGold
                    dpsMeter.style.color = "#FFD700";
                    dpsMeter.style.textShadow = "-1px 0 3px #FFA500, 0 1px 3px #FFA500, 1px 0 3px #FFA500, 0 -1px 3px #FFA500";
                }
        }

        // HPS bar
        if (roleHealers.indexOf(combatant["Job"]) > -1)
        {
            let boxCell = tRowHps.insertCell(healerIdx);
            boxCell.innerHTML = parseActFormat(boxHpsHTML, combatant);
            if (totalHPS > 0)
                boxCell.style.width = Math.round(combatant["effhps"] * 100 / totalHPS).toString() + "%";
            else
                boxCell.style.width = "0%";

            let lightBar = boxCell.getElementsByClassName("lightbar")[0];
            lightBar.style.backgroundColor = lightBarColors[(healerIdx + 3) % 8];
            lightBar.style.height = "2px";
            lightBar.style.opacity = "0.5";
            lightBar.style.boxShadow = "0 -1px 2px " + lightBarColors[(healerIdx + 3) % 8];
            ++healerIdx;
        }
    }

    if (tbodyDOld != void(0)) {
        tableD.replaceChild(tbodyDNew, tbodyDOld);
    }
    else {
        tableD.appendChild(tbodyDNew);
    }

    if (tbodyHOld != void(0)) {
        tableH.replaceChild(tbodyHNew, tbodyHOld);
    }
    else {
        tableH.appendChild(tbodyHNew);
    }
}


