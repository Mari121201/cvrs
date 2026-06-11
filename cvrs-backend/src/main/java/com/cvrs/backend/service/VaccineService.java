package com.cvrs.backend.service;

import com.cvrs.backend.model.Vaccine;
import com.cvrs.backend.repository.VaccineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VaccineService {

    @Autowired
    private VaccineRepository vaccineRepository;

    public List<Vaccine> getAllVaccines() {
        return vaccineRepository.findAll();
    }

    public Vaccine getVaccineById(Long id) {
        return vaccineRepository.findById(id).orElse(null);
    }

    public Vaccine addVaccine(Vaccine vaccine) {
        if (vaccineRepository.existsByName(vaccine.getName())) {
            throw new RuntimeException("Vaccine with this name already exists");
        }
        return vaccineRepository.save(vaccine);
    }

    public Vaccine updateVaccine(Long id, Vaccine vaccineDetails) {
        Vaccine vaccine = vaccineRepository.findById(id).orElse(null);
        if (vaccine != null) {
            vaccine.setName(vaccineDetails.getName());
            vaccine.setDescription(vaccineDetails.getDescription());
            vaccine.setAgeInMonths(vaccineDetails.getAgeInMonths());
            vaccine.setManufacturer(vaccineDetails.getManufacturer());
            vaccine.setComposition(vaccineDetails.getComposition());
            vaccine.setDosage(vaccineDetails.getDosage());
            vaccine.setRoute(vaccineDetails.getRoute());
            vaccine.setContraindications(vaccineDetails.getContraindications());
            return vaccineRepository.save(vaccine);
        }
        return null;
    }

    public void deleteVaccine(Long id) {
        vaccineRepository.deleteById(id);
    }

    public List<Vaccine> getVaccinesByAge(int ageInMonths) {
        return vaccineRepository.findByAgeInMonths(ageInMonths);
    }

    public List<Vaccine> getVaccinesByAgeRange(int minAge, int maxAge) {
        return vaccineRepository.findByAgeInMonthsBetween(minAge, maxAge);
    }

    public List<Vaccine> getVaccinesUpToAge(int ageInMonths) {
        return vaccineRepository.findVaccinesUpToAge(ageInMonths);
    }

    public List<Vaccine> getUpcomingVaccines(int currentAge) {
        return vaccineRepository.findUpcomingVaccines(currentAge);
    }
}