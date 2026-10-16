# Fort Canning Time Traveller — Heritage Passport Prototype

A static mobile-friendly educational website with three historical chapters and a five-landmark photo passport.

## Run locally

1. Extract the ZIP archive.
2. Open `index.html` in Chrome or Edge. The stories and photos work without a server. Maps require internet access.
3. For more reliable testing, run a local web server from the extracted folder:

   ```powershell
   py -m http.server 8000
   ```

   Then open http://localhost:8000 in your browser.

## Test the camera

On a phone, open the deployed website over HTTPS and tap **Take a photo** on a landmark card. The camera or a camera/file chooser will open depending on the device and browser. On desktop, the button opens a file picker. Captured photos are processed locally in the browser; they are not uploaded or saved to a server.

The experimental automatic image comparison uses colour and brightness features and is **not** reliable landmark recognition. Different viewpoints, crops and lighting can prevent a true match, and unrelated photos may match. Visitors therefore explicitly confirm their own visit before collecting a stamp. The passport is a self-reported learning activity, not a verified attendance system.

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, `passport.js`, and the complete `assets/` folder to the repository root.
3. Go to **Settings → Pages** and choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait for the Pages URL and open it on a phone. GitHub Pages provides HTTPS.

Alternatively, drag the entire site folder to Netlify Drop. Make sure the `assets` directory is included.

## What is included

- Three educational history chapters and nine quiz questions
- Five real Fort Canning locations with photographs, embedded Google Maps and walking-directions links
- Camera/file input, experimental on-device visual comparison and manual visit confirmation
- Heritage stories unlocked after visit confirmation
- Five passport stamps saved in browser localStorage
- Separate chapter quiz progress saved in browser localStorage

## Credits and limitations

Reference photographs were extracted from the team's supplied `TFM1_T2_City Hall.pdf` presentation, pages 8–9 and 15–16. Check underlying photo rights before publishing publicly. Historical summaries are based on the same team presentation and should be reviewed against official heritage sources before public deployment. This is a student prototype and is not an official NParks or National Heritage Board service. Google Maps requires an internet connection, and embedded maps may be restricted by some browsers.

To add landmarks, edit the `places` array at the top of `passport.js` and provide a corresponding reference photo in `assets/`.
