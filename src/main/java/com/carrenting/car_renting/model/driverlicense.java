package com.carrenting.car_renting.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "driver_licenses")
public class driverlicense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "license_id")
    private Integer licenseId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private renter renter;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "license_class", nullable = false, length = 10)
    private String licenseClass;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private admin verifiedBy;

    // Getters and Setters
    public Integer getLicenseId() { return licenseId; }
    public void setLicenseId(Integer licenseId) { this.licenseId = licenseId; }

    public renter getRenter() { return renter; }
    public void setRenter(renter renter) { this.renter = renter; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getLicenseClass() { return licenseClass; }
    public void setLicenseClass(String licenseClass) { this.licenseClass = licenseClass; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public admin getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(admin verifiedBy) { this.verifiedBy = verifiedBy; }
}