var video = document.querySelector("#videoElement");

        // Initialize UI with loading state
        document.getElementById("videoCoords").innerText = "Getting location...";
        document.getElementById("coords").innerText = "Requesting location permissions...";

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: { exact: "environment" }
                } 
            })
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (error) {
                    console.log("Something went wrong with camera!");
                    // Fallback to any available camera if rear camera fails
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(function (stream) {
                            video.srcObject = stream;
                        })
                        .catch(function (fallbackError) {
                            console.log("No camera available!");
                        });
                });
        }

        // Reference point
        const refLat = 26.27054;
        const refLong = 73.03468;

        // Tolerance set to 0.0002°
        const tolerance = 0.0002;

        const latMin = refLat - tolerance;
        const latMax = refLat + tolerance;
        const lonMin = refLong - tolerance;
        const lonMax = refLong + tolerance;

        let timeoutID = null;

        if ("geolocation" in navigator) {
            // Options for geolocation
            const geoOptions = {
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds timeout
                maximumAge: 60000 // Accept cached position up to 1 minute old
            };

            navigator.geolocation.watchPosition(function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                document.getElementById("videoCoords").innerText =
                    "Lat: " + latitude.toFixed(6) + "\nLong: " + longitude.toFixed(6);

                document.getElementById("coords").innerText =
                    "Lat: " + latitude.toFixed(6) + " , Long: " + longitude.toFixed(6) +
                    "\nRange → Lat: " + latMin.toFixed(6) + " – " + latMax.toFixed(6) +
                    " | Long: " + lonMin.toFixed(6) + " – " + lonMax.toFixed(6);

                const inRange = latitude >= latMin && latitude <= latMax &&
                                longitude >= lonMin && longitude <= lonMax;

                if (inRange) {
                    document.getElementById("model1").style.display = "block";
                    if (timeoutID) {
                        clearTimeout(timeoutID);
                        timeoutID = null;
                    }
                } else if (!inRange && document.getElementById("model1").style.display === "block") {
                    if (!timeoutID) {
                        timeoutID = setTimeout(() => {
                            document.getElementById("model1").style.display = "none";
                            timeoutID = null;
                        }, 5000); // 5-second tolerance
                    }
                }

            }, function (error) {
                let errorMessage = "Error reading your location: ";
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Location access denied. Please enable location permissions and reload.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information unavailable. Please check your GPS/internet connection.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage += "Unknown error occurred. Please reload and try again.";
                        break;
                }
                
                console.log(errorMessage);
                alert(errorMessage);
                
                // Update UI to show error state
                document.getElementById("videoCoords").innerText = "Location Error";
                document.getElementById("coords").innerText = "Please enable location permissions and reload the page.";
                
            }, geoOptions);
        } else {
            alert("Geolocation services are not available on this device!");
            document.getElementById("videoCoords").innerText = "Geolocation Not Supported";
            document.getElementById("coords").innerText = "Your device doesn't support geolocation.";
        }