package com.carrenting.car_renting.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("RENTER")
public class renter extends user {

    @JsonManagedReference
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @OneToOne(mappedBy = "renter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private driverlicense driverLicense;

    public renter() {
        super();
    }

    public driverlicense getDriverLicense() { return driverLicense; }
    public void setDriverLicense(driverlicense driverLicense) {
        this.driverLicense = driverLicense;
        if (driverLicense != null) {
            driverLicense.setRenter(this);
        }
    }

    public boolean hasApprovedLicense() {
        return driverLicense != null
            && "APPROVED".equals(driverLicense.getVerificationStatus());
    }
}