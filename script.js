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

        // Define multiple locations with their images
        const locations = [
            {
                name: "Location 1",
                lat: 26.2675,
                long: 73.035000,
                tolerance: 0.0003,
                image: "Hints/hint 1.webp", // Add your image path
            },
            {
                name: "Location 2", 
                lat: 26.268889, // Different coordinates
                long: 73.035556,
                tolerance: 0.0003,
                image: "Hints/hint 2.png.webp",
            },
            {
                name: "Location 3",
                lat: 26.269445,
                long: 73.035556,
                tolerance: 0.0003,
                video: "Hints/Portrait.mp4", // Video instead of image
            }
        ];

        // Keep original reference for backward compatibility
        const refLat = 26.27054;
        const refLong = 73.03468;
        const tolerance = 0.0002;

        let timeoutID = null;
        let currentlyPlayingVideo = false; // Flag to prevent video restart

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

                // Check each location
                let foundLocation = null;
                
                for (let location of locations) {
                    const latMin = location.lat - location.tolerance;
                    const latMax = location.lat + location.tolerance;
                    const lonMin = location.long - location.tolerance;
                    const lonMax = location.long + location.tolerance;
                    
                    const inRange = latitude >= latMin && latitude <= latMax &&
                                    longitude >= lonMin && longitude <= lonMax;
                    
                    if (inRange) {
                        foundLocation = location;
                        break; // Stop at first match
                    }
                }

                // Update coordinates display with range info
                let coordsText = "Lat: " + latitude.toFixed(6) + " , Long: " + longitude.toFixed(6);
                if (foundLocation) {
                    const latMin = foundLocation.lat - foundLocation.tolerance;
                    const latMax = foundLocation.lat + foundLocation.tolerance;
                    const lonMin = foundLocation.long - foundLocation.tolerance;
                    const lonMax = foundLocation.long + foundLocation.tolerance;
                    
                    coordsText += "\n🎯 " + foundLocation.name + " Range:" +
                                  "\nLat: " + latMin.toFixed(6) + " – " + latMax.toFixed(6) +
                                  " | Long: " + lonMin.toFixed(6) + " – " + lonMax.toFixed(6);
                }
                
                document.getElementById("coords").innerText = coordsText;

                // Show/hide location content
                if (foundLocation) {
                    // Don't show text message - only show image/video
                    // document.getElementById("model1").innerText = foundLocation.message;
                    
                    // Check if it's a video location
                    if (foundLocation.video) {
                        // Show video
                        const videoElement = document.getElementById("locationVideo");
                        if (videoElement) {
                            // Only set src and play if not already playing
                            if (!currentlyPlayingVideo) {
                                videoElement.src = foundLocation.video;
                                videoElement.style.display = "block";
                                currentlyPlayingVideo = true;
                                
                                // Play video once and freeze on last frame
                                videoElement.loop = false; // Don't loop
                                videoElement.muted = false; // Enable sound
                                videoElement.play();
                                
                                // When video ends, pause it
                                videoElement.onended = function() {
                                    videoElement.pause(); // Stop the video
                                    // Video stays visible showing the last frame
                                };
                            } else {
                                // Video is already playing/played, just ensure it's visible
                                videoElement.style.display = "block";
                            }
                        }
                        
                        // Hide image if it was previously shown
                        const imageElement = document.getElementById("locationImage");
                        if (imageElement) {
                            imageElement.style.display = "none";
                        }
                    } else {
                        // Show image (for locations 1 and 2)
                        const imageElement = document.getElementById("locationImage");
                        if (imageElement) {
                            imageElement.src = foundLocation.image;
                            imageElement.style.display = "block";
                        }
                        
                        // Hide video if it was previously shown
                        const videoElement = document.getElementById("locationVideo");
                        if (videoElement) {
                            videoElement.style.display = "none";
                            videoElement.pause();
                            // Don't reset currentlyPlayingVideo flag here - keep it for switching between locations
                        }
                    }
                    
                    // Don't show the text popup
                    // document.getElementById("model1").style.display = "block";
                    
                    if (timeoutID) {
                        clearTimeout(timeoutID);
                        timeoutID = null;
                    }
                } else if (document.getElementById("locationImage").style.display === "block" || 
                          document.getElementById("locationVideo").style.display === "block") {
                    // User has left the location area - start timeout to hide content
                    if (!timeoutID) {
                        timeoutID = setTimeout(() => {
                            // Hide image
                            const imageElement = document.getElementById("locationImage");
                            if (imageElement) {
                                imageElement.style.display = "none";
                            }
                            
                            // Hide video
                            const videoElement = document.getElementById("locationVideo");
                            if (videoElement) {
                                videoElement.style.display = "none";
                                videoElement.pause();
                                videoElement.currentTime = 0; // Reset video to beginning
                                currentlyPlayingVideo = false; // Reset flag so video can play again
                            }
                            
                            timeoutID = null;
                        }, 5000); // 5-second tolerance
                    }
                } else {
                    // User is not in any location and no content is showing - clear any existing timeout
                    if (timeoutID) {
                        clearTimeout(timeoutID);
                        timeoutID = null;
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