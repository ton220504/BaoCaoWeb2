package com.tranvantoan.example205.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tranvantoan.example205.model.AppUser;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Integer> {
    Optional<AppUser> findByUsername(String username);

    Boolean existsByUsername(String username);
}