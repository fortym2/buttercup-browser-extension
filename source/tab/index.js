import { onIdentifiedTarget, watchLogin } from "./login.js";
import { attachLaunchButton } from "./launch.js";
import { getLastLoginStatus, startMessageListeners, transferLoginCredentials } from "./messaging.js";
import { getSharedTracker } from "./LoginTracker.js";
import { showSaveDialog } from "./saveDialog.js";
import { watchInputs } from "./generator.js";

// Wait for a target
function waitAndAttachLaunchButtons() {
    onIdentifiedTarget(loginTarget => {
        const { usernameField, passwordField } = loginTarget;
        if (passwordField) {
            attachLaunchButton(passwordField);
        }
        if (usernameField) {
            attachLaunchButton(usernameField);
        }
        watchLogin(
            loginTarget,
            username => {
                const tracker = getSharedTracker();
                tracker.username = username;
            },
            password => {
                const tracker = getSharedTracker();
                tracker.password = password;
            },
            () => {
                const tracker = getSharedTracker();
                transferLoginCredentials({
                    username: tracker.username,
                    password: tracker.password,
                    url: tracker.url,
                    title: tracker.title,
                    timestamp: Date.now()
                });
            }
        );
    });
}

// Manage login form detection
waitAndAttachLaunchButtons();

// Watch for inputs that can be used with password generation
watchInputs();

// Handle app communication
startMessageListeners();

// Check to see if any logins were recorded
getLastLoginStatus()
    .then(result => {
        if (result.credentials) {
            showSaveDialog();
        }
    })
    .catch(err => {
        console.error("An error occurred while communicating with the Buttercup extension");
        console.error(err);
    });
