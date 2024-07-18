const { ipcRenderer, getVersion } = window.electron

const version = document.getElementById('version')
const warp = document.getElementById('warp');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const loaderDownload = document.getElementById('warp-loader')

getVersion.app().then((appVersion) => {
    version.innerText = appVersion;
})

ipcRenderer.receive('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    warp.classList.remove('hidden');
    loaderDownload.classList.remove('hidden');
});

ipcRenderer.receive('update_progress', (progress) => {
    let updateProgress = progress;
    const progsDown = document.getElementById('download-progress')
    progsDown.style.width = updateProgress + '%'
    progsDown.setAttribute('aria-valuenow', updateProgress)
});

ipcRenderer.receive('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('d-none');
    warp.classList.remove('hidden');

    loaderDownload.classList.add('hidden');
});

restartButton.addEventListener("click", (e) => {
    ipcRenderer.send('restart_app');
})

ipcRenderer.receive('update_error', (error) => {
    ipcRenderer.removeAllListeners('update_error');
    message.innerText = 'Error in downloading the update. Please try again later.';
    warp.classList.remove('hidden');
    loaderDownload.classList.add('hidden');
});
