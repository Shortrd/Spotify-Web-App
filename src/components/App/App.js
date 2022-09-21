import React from 'react';
import './App.css';
import { SearchBar } from '../SearchBar/SearchBar';
import { SearchResults } from '../SearchResults/SearchResults';
import { Playlist } from '../Playlist/Playlist';
import { Spotify } from '../../util/Spotify';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayName: 'Default Name',
            playlistName: 'Custom Playlist Name 1',
            activeDeviceID: '',
            searchResults: [],
            playlistTracks: [],
            devices: [],
            isPlaying: false
        }
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
        this.getDevices = this.getDevices.bind(this);
        this.startPlayback = this.startPlayback.bind(this);
    }
    addTrack(track) {
        let tracks = this.state.playlistTracks;
        if(tracks.find(savedTrack => savedTrack.id === track.id)) {
            return;
        }
        tracks.push(track);
        this.setState({ playlistTracks: tracks });
        
        for(let i = 0; i < this.state.searchResults.length; i++) {
            if(this.state.searchResults[i].id === track.id) {
                this.state.searchResults.splice(i,1);
            }
        }
    }
    removeTrack(track) {
        let updatedPlaylistTracks = this.state.playlistTracks.filter(playlistTrack => playlistTrack.id !== track.id);
        this.setState({ playlistTracks: updatedPlaylistTracks });

        this.state.searchResults.unshift(track);
    }
    updatePlaylistName(name) {
        this.setState({ playlistName: name });
    }
    savePlaylist() {
        let trackURIs = this.state.playlistTracks.map(track => track.uri);
        Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
            this.setState({ 
                playlistName: 'New Playlist',
                playlistTracks: []
            })
        })
    }
    search(term) {
        Spotify.search(term).then(searchResults => {
            this.setState({ searchResults: searchResults });
        })
    }
    getDisplayName() {
        Spotify.getDisplayName().then(names => {
            if(names.id) {
                this.setState({ displayName: names.id })
            }
            if(names.displayName) {
                this.setState({ displayName: names.displayName })
            }
        })
    }
    getDevices() {
        Spotify.getAvailableDevices().then(devices => {
            this.setState({ devices: devices })
        })
    }
    getActiveDeviceID() {
        /*let activeDeviceID = '';

        this.state.devices.filter(device => {
            // if no active device, use any available device
            if(!device.deviceIsActive) {
                activeDeviceID = device[0].deviceID;
            } else {
                activeDeviceID = device;
                activeDeviceID = activeDeviceID[0].deviceID;
            }
        })
        
        this.setState({ activeDeviceID: activeDeviceID });*/
        let activeDeviceID = this.state.devices.filter(device => device.deviceIsActive === true)
        activeDeviceID = activeDeviceID[0].deviceID;
        this.setState({ activeDeviceID: activeDeviceID });
    }
    startPlayback(trackURI) {
        this.getActiveDeviceID();
        trackURI = [trackURI];
        Spotify.startPlayback(this.state.activeDeviceID, trackURI);
    }
    componentDidMount() {
        this.getDisplayName();
        this.getDevices();
    }
    render() {
        return (
            <div>
                <h1>Ja<span className="highlight">mmm</span>ing with <span className="highlight">{this.state.displayName}</span></h1>
                <div className="App">
                    <SearchBar onSearch={this.search} />
                    <div className="App-playlist">
                        <SearchResults searchResults={this.state.searchResults}
                        onAdd={this.addTrack} onPlay={this.startPlayback}/>
                        <Playlist playlistName={this.state.playlistName}
                        playlistTracks={this.state.playlistTracks}
                        onRemove={this.removeTrack}
                        onNameChange={this.updatePlaylistName}
                        onSave={this.savePlaylist} />
                    </div>
                </div>
            </div>
            
        )
    }
}

export default App;
