const playerForm = document.getElementById("playerForm");
const playersTable = document.getElementById("playersTable");
const message = document.getElementById("message");
const search = document.getElementById("search");

let allPlayers = [];

async function loadPlayers() {
    try {
        const response = await fetch("http://localhost:3000/api/players");

        if (!response.ok) {
            throw new Error("Failed to load players");
        }

        allPlayers = await response.json();
        displayPlayers(allPlayers);
        updateStatistics();
    } catch (error) {
        if (playersTable) {
            playersTable.innerHTML =
                '<tr><td colspan="7">Unable to load players. Check the server.</td></tr>';
        }
        console.error(error);
    }
}
function displayPlayers(players) {
    if (!playersTable) return;

    if (players.length === 0) {
        playersTable.innerHTML =
            '<tr><td colspan="7">No players found.</td></tr>';
        return;
    }

    playersTable.innerHTML = players.map(player => `
        <tr>
            <td>${player.playerId}</td>
            <td>${escapeHTML(player.name)}</td>
            <td>${player.age}</td>
            <td>${escapeHTML(player.sport)}</td>
            <td>${escapeHTML(player.membershipType || "Basic")}</td>
            <td>${escapeHTML(player.membershipStatus || "Active")}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editPlayer(${player.playerId})">Edit</button>
                <button class="action-btn delete-btn" onclick="deletePlayer(${player.playerId})">Delete</button>
            </td>
        </tr>
    `).join("");
}



function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function updateStatistics() {
    const totalPlayers = document.getElementById("totalPlayers");
    const activeMembers = document.getElementById("activeMembers");
    const totalSports = document.getElementById("totalSports");

    if (totalPlayers) {
        totalPlayers.textContent = allPlayers.length;
    }

    if (activeMembers) {
        activeMembers.textContent = allPlayers.filter(
            player => (player.membershipStatus || "Active") === "Active"
        ).length;
    }

    if (totalSports) {
        totalSports.textContent = new Set(
            allPlayers.map(player => player.sport).filter(Boolean)
        ).size;
    }
}

if (playerForm) {
    playerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const player = {
            playerId: Number(document.getElementById("playerId").value),
            name: document.getElementById("name").value.trim(),
            age: Number(document.getElementById("age").value),
            sport: document.getElementById("sport").value,
            membershipType: document.getElementById("membershipType").value,
            membershipStatus: document.getElementById("membershipStatus").value
        };

        try {
            const response = await fetch("http://localhost:3000/api/players", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(player)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to add player");
            }

            if (message) {
                message.textContent = result.message || "Player added successfully!";
                message.style.color = "green";
            }

            playerForm.reset();
            await loadPlayers();
        } catch (error) {
            if (message) {
                message.textContent = error.message;
                message.style.color = "red";
            }
        }
    });
}

async function editPlayer(id) {
    const player = allPlayers.find(item => item.playerId === id);

    if (!player) return;

    const name = prompt("Enter player name:", player.name);
    if (name === null) return;

    const ageInput = prompt("Enter player age:", player.age);
    if (ageInput === null) return;

    const age = Number(ageInput);

    if (!name.trim() || !Number.isInteger(age) || age <= 0) {
        alert("Enter a valid name and positive whole-number age.");
        return;
    }

    const sport = prompt("Enter sport:", player.sport);
    if (sport === null) return;

    const membershipType = prompt(
        "Enter membership type:",
        player.membershipType || "Basic"
    );
    if (membershipType === null) return;

    const membershipStatus = prompt(
        "Enter status (Active or Inactive):",
        player.membershipStatus || "Active"
    );
    if (membershipStatus === null) return;

    if (!sport.trim() || !membershipType.trim()) {
        alert("Sport and membership type cannot be empty.");
        return;
    }

    if (!["Active", "Inactive"].includes(membershipStatus)) {
        alert("Status must be Active or Inactive.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/players/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    age,
                    sport: sport.trim(),
                    membershipType: membershipType.trim(),
                    membershipStatus
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to update player");
        }

        alert(result.message || "Player updated successfully!");
        await loadPlayers();
    } catch (error) {
        alert(error.message);
    }
}

async function deletePlayer(id) {
    if (!confirm("Are you sure you want to delete this player?")) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/players/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to delete player");
        }

        alert(result.message || "Player deleted successfully!");
        await loadPlayers();
    } catch (error) {
        alert(error.message);
    }
}

if (search) {
    search.addEventListener("input", function () {
        const searchText = search.value.toLowerCase();

        const filteredPlayers = allPlayers.filter(player =>
            `${player.playerId} ${player.name} ${player.sport}`
                .toLowerCase()
                .includes(searchText)
        );

        displayPlayers(filteredPlayers);
    });
}

loadPlayers();
