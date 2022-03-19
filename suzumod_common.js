const encounterTitle = "{title} / Time: {duration} / DPS: {encdps}";

const lightBarColors = [
    "rgba(255, 159, 159, 1.0)",
    "rgba(236, 207, 129, 1.0)",
    "rgba(191, 246, 136, 1.0)",
    "rgba(146, 252, 174, 1.0)",
    "rgba(127, 223, 223, 1.0)",
    "rgba(146, 174, 252, 1.0)",
    "rgba(191, 136, 246, 1.0)",
    "rgba(236, 129, 207, 1.0)",
];

const config = {
    "duration": 60,  // Time duration after which DPSes are colored accordingly
    "dpsUpper": 125, // 'well played' players colored gold
    "dpsLower": 75,  // 'poorly played' DPS players colored red
    "dpsTank": 74,   // 'well played' tanks who managed to deliver a relatively high DPS but not exceeding the 'gold' standard
    "dpsHealer": 68, // 'well played' healers ...
};

const roleTanks = ["Gla", "Mrd", "Pld", "War", "Drk", "Gnb"];
const roleDPSes = ["Pgl", "Mnk", "Lnc", "Drg", "Arc", "Brd", "Rog", "Nin", "Mch", "Acn", "Smn", "Thm", "Blm", "Sam", "Rdm", "Blu", "Dnc", "Rpr"];
const roleHealers = ["Cnj", "Whm", "Sch", "Ast", "Sge"];
const roles = [].concat(roleTanks, roleDPSes, roleHealers);

let dpsAverage = 0;
let duration = 0;

document.addEventListener("onOverlayStateUpdate", function (e) {
    if (!e.detail.isLocked) {
        displayResizeHandle();
    } else {
        hideResizeHandle();
    }
});

function displayResizeHandle() { document.documentElement.classList.add("resizeHandle"); }

function hideResizeHandle() { document.documentElement.classList.remove("resizeHandle"); }

function printDebug(ss) { document.getElementById("debug").innerText += ss; }

document.addEventListener("onOverlayDataUpdate", function (e) {
    update(e.detail);
});

window.addOverlayListener("CombatData", update);
window.startOverlayEvents();

// 表示要素の更新
function update(data) {
    suzuMod(data);
    fetchJobIcon(data);
    updateEncounter(data);
    updateCombatantList(data);
}

function fetchJobIcon(data) {
    for (let combatant_name in data.Combatant) {
        let combatant = data.Combatant[combatant_name];
        if (roles.indexOf(combatant["Job"]) > -1)
            combatant["icon"] = `<img class="jobicon" alt="${combatant["Job"]}" src="jobicon/${combatant["Job"]}.png">`;
        else
            combatant["icon"] = "";
    }
}

// Parse Miniparse formats and return proper strings
function parseActFormat(str, dictionary) {
    var result = "";
    var currentIndex = 0;
    do {
        var openBraceIndex = str.indexOf('{', currentIndex);
        if (openBraceIndex < 0) {
            result += str.slice(currentIndex);
            break;
        }
        else {
            result += str.slice(currentIndex, openBraceIndex);
            var closeBraceIndex = str.indexOf('}', openBraceIndex);
            if (closeBraceIndex < 0) {
                // parse error!
                console.log("parseActFormat: Parse error: missing close-brace for " + openBraceIndex.toString() + ".");
                return "ERROR";
            }
            else {
                var tag = str.slice(openBraceIndex + 1, closeBraceIndex);
                if (typeof dictionary[tag] !== 'undefined') {
                    result += dictionary[tag];
                }
                else {
                    console.log("parseActFormat: Unknown tag: " + tag);
                    result += "ERROR";
                }
                currentIndex = closeBraceIndex + 1;
            }
        }
    } while (currentIndex < str.length);

    return result;
}
