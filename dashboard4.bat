@echo off

set WIDTH=960
set HEIGHT=540
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"

:: Kiri Atas
start "" %CHROME% --new-window --window-position=0,0 --window-size=%WIDTH%,%HEIGHT% --app="https://appuksidashboard-f6792pb29s9bzs97lujcg6.streamlit.app/" --disable-features=WindowControlsOverlay

timeout /t 1 >nul

:: Kanan Atas
start "" %CHROME% --new-window --window-position=%WIDTH%,0 --window-size=%WIDTH%,%HEIGHT% --app="https://weather-forecast-mge.vercel.app/" --disable-features=WindowControlsOverlay

timeout /t 1 >nul

:: Kiri Bawah
start "" %CHROME% --new-window --window-position=0,%HEIGHT% --window-size=%WIDTH%,%HEIGHT% --app="https://idletimedashboardgit-xbfpevkk5cjaxqsmcw8gwg.streamlit.app/" --disable-features=WindowControlsOverlay

timeout /t 1 >nul

:: Kanan Bawah
start "" %CHROME% --new-window --window-position=%WIDTH%,%HEIGHT% --window-size=%WIDTH%,%HEIGHT% --app="https://eyes.ptdigital.co.id/" --disable-features=WindowControlsOverlay