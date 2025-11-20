const session = await CFC_BUILD_SESSION({
    user_id: uid,
    email: email,
    license_valid: true,
    render_valid: renderOK,
    firestore_valid: firestoreOK,
    device_id: myDeviceId
});
