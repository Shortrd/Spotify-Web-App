let accessToken;
const clientID = '38e5c986920644ccaa526d3d001702b1';
const redirectURI = 'http://shortrd.github.io/Spotify-Web-App'; // https://spotify-web-app-1.netlify.app

export const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        
        // get access token from url
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            // clear the parameters from the URL, so the app doesn’t try grabbing the access token after it has expired
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const redirectURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public%20user-read-currently-playing%20user-read-playback-state%20user-modify-playback-state&redirect_uri=${redirectURI}`;

            window.location = redirectURL;
        }

    },
    search(term) {
        const accessToken = Spotify.getAccessToken();

        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.json()
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }))
        });
    },
    savePlaylist(name, trackURIs) {
        if (!name || !trackURIs.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userID;

        // make request to Spotify API to get user's Spotify username
        return fetch('https://api.spotify.com/v1/me', { headers: headers }
        ).then(response => response.json()
        ).then(jsonResponse => {
            userID = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackURIs })
                })
            })
        })
    },
    getDisplayName() {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userID;
        let displayName;

        // make GET request to Spotify API to get user's Spotify username
        return fetch('https://api.spotify.com/v1/me', { headers: headers }
        ).then(response => response.json()
        ).then(jsonResponse => {
            userID = jsonResponse.id;
            displayName = jsonResponse.display_name;

            return { 
                id: userID,
                displayName: displayName
            };
        })
    },
    getAvailableDevices() {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };

        // make GET request to Spotify API to get the user's available devices
        return fetch('https://api.spotify.com/v1/me/player/devices', {
            headers: headers,
            method: 'GET'
        }
        ).then(response => {
            return response.json()
        }).then(jsonResponse => {
            return jsonResponse.devices.map(device => ({
                deviceID: device.id,
                deviceName: device.name,
                deviceType: device.type,
                deviceIsActive: device.is_active
            }))
        })
    },
    startPlayback(deviceID, trackURI) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };

        return fetch('https://api.spotify.com/v1/me/player/play', {
            headers: headers,
            method: 'PUT',
            q: JSON.stringify({ device_id: deviceID }),
            body: JSON.stringify({ uris: trackURI })
        })
    }
}