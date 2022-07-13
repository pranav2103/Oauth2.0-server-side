class Tokens {
    constructor(accessToken, RefreshToken, ExpiresIn) {
        this.accessToken = accessToken;
        this.RefreshToken = RefreshToken;
        this.ExpiresIn = ExpiresIn;
    }
    getAccessToken() {
        return this.accessToken;
    }
    getRrefreshToken(){
        return this.RefreshToken;
    }
}

module.exports = Tokens;