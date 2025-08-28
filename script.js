var video = document.querySelector("#videoElement");

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
                alert("Error reading your current location. Please reload and give permission!");
            });
        } else {
            alert("Geolocation services are not available on this device!");
        }