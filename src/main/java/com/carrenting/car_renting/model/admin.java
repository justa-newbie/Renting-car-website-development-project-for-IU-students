package com.carrenting.car_renting.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMIN")
public class admin extends user {

    public admin() {
        super();
    }
}