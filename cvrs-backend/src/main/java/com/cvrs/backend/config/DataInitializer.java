package com.cvrs.backend.config;

import com.cvrs.backend.model.User;
import com.cvrs.backend.model.Vaccine;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.repository.VaccineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@cvrs.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@cvrs.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setIsDeleted(false);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("Admin user created successfully");
        }
        long vaccineCount = vaccineRepository.count();

        // Create doctor user if not exists
        if (!userRepository.existsByEmail("doctor@cvrs.com")) {
            User doctor = new User();
            doctor.setName("Dr. Sample Doctor");
            doctor.setEmail("doctor@cvrs.com");
            doctor.setPassword(passwordEncoder.encode("doctor123"));
            doctor.setRole("DOCTOR");
            doctor.setSpecialization("Pediatrician");
            doctor.setLicenseNumber("LIC123456");
            doctor.setExperience(5.5);
            doctor.setIsDeleted(false);
            doctor.setCreatedAt(LocalDateTime.now());
            doctor.setUpdatedAt(LocalDateTime.now());
            userRepository.save(doctor);
            System.out.println("Doctor user created successfully");
        }

        if (vaccineCount == 0) {
            System.out.println("Creating sample vaccines...");

            Vaccine[] vaccines = {
                    createVaccine("BCG", 0, "Tuberculosis vaccine given at birth"),
                    createVaccine("Hepatitis B - Dose 1", 0, "First dose of Hepatitis B"),
                    createVaccine("Polio (OPV) - Dose 1", 0, "First dose of Oral Polio Vaccine"),
                    createVaccine("Pentavalent - Dose 1", 2, "First dose of DPT-HepB-Hib"),
                    createVaccine("Polio (OPV) - Dose 2", 2, "Second dose of Oral Polio Vaccine"),
                    createVaccine("Rotavirus - Dose 1", 2, "First dose of Rotavirus vaccine"),
                    createVaccine("Pentavalent - Dose 2", 4, "Second dose of DPT-HepB-Hib"),
                    createVaccine("Polio (OPV) - Dose 3", 4, "Third dose of Oral Polio Vaccine"),
                    createVaccine("Rotavirus - Dose 2", 4, "Second dose of Rotavirus vaccine"),
                    createVaccine("Pentavalent - Dose 3", 6, "Third dose of DPT-HepB-Hib"),
                    createVaccine("Polio (IPV)", 6, "Inactivated Polio Vaccine"),
                    createVaccine("Rotavirus - Dose 3", 6, "Third dose of Rotavirus vaccine"),
                    createVaccine("Measles/Rubella - Dose 1", 9, "First dose of Measles and Rubella"),
                    createVaccine("Vitamin A - Dose 1", 9, "First dose of Vitamin A"),
                    createVaccine("Measles/Rubella - Dose 2", 16, "Second dose of Measles and Rubella"),
                    createVaccine("Vitamin A - Dose 2", 16, "Second dose of Vitamin A"),
                    createVaccine("DPT Booster", 18, "Diphtheria, Pertussis, Tetanus booster")
            };

            for (Vaccine vaccine : vaccines) {
                vaccineRepository.save(vaccine);
            }

            System.out.println("✓ " + vaccines.length + " sample vaccines created");

        } else {
            System.out.println("✓ " + vaccineCount + " vaccine(s) already exist");
        }
    }
    private Vaccine createVaccine(String name, int ageInMonths, String description) {
        Vaccine vaccine = new Vaccine();
        vaccine.setName(name);
        vaccine.setAgeInMonths(ageInMonths);
        vaccine.setDescription(description);
        vaccine.setCreatedAt(LocalDateTime.now());
        vaccine.setUpdatedAt(LocalDateTime.now());
        return vaccine;
    }

}