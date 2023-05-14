class AbstractGameState {

    #name;

    constructor(name) {
        this.#name = name;
    }

    sendMessage(player, msg) {
        console.log("[AbstractGameState] Not implemented yet : sendMessage")
    }
}

module.exports = AbstractGameState;