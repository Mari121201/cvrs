package com.cvrs.backend.service;

import com.cvrs.backend.model.Child;
import com.cvrs.backend.model.User;
import com.cvrs.backend.model.VaccinationSchedule;
import com.cvrs.backend.model.Vaccine;
import com.cvrs.backend.repository.ChildRepository;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.repository.VaccineRepository;
import com.cvrs.backend.repository.VaccineScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChildService {

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private VaccineScheduleRepository vaccineScheduleRepository;

    @Transactional
    public boolean addChild(Child child, String email) {
        try {
            System.out.println("Looking up user with email: " + email);
            User parent = userRepository.findByEmail(email).orElse(null);

            if (parent == null) {
                System.out.println("Parent not found for email: " + email);
                return false;
            }

            System.out.println("Found parent: " + parent.getName() + " with ID: " + parent.getId());

            child.setParent(parent);
            child.setIsDeleted(0);
            Child savedChild = childRepository.save(child);

            System.out.println("Child saved with ID: " + savedChild.getId());

            // Create vaccination schedules for all vaccines
            List<Vaccine> vaccines = vaccineRepository.findAll();
            System.out.println("Found " + vaccines.size() + " vaccines to schedule");

            for (Vaccine vaccine : vaccines) {
                VaccinationSchedule schedule = new VaccinationSchedule();
                schedule.setChild(savedChild);
                schedule.setVaccine(vaccine);

                LocalDate dueDate = child.getDob().plusMonths(vaccine.getAgeInMonths());
                schedule.setDueDate(dueDate);

                // Determine status
                if (dueDate.isBefore(LocalDate.now())) {
                    schedule.setStatus("OVERDUE");
                } else {
                    schedule.setStatus("PENDING");
                }

                vaccineScheduleRepository.save(schedule);
                System.out.println("Created schedule for vaccine: " + vaccine.getName());
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public List<Child> getChildren(String email) {
        try {
            System.out.println("Fetching children for email: " + email);
            User parent = userRepository.findByEmail(email).orElse(null);

            if (parent == null) {
                System.out.println("Parent not found for email: " + email);
                return List.of();
            }

            // Only return non-deleted children
            List<Child> children = childRepository.findByParentAndIsDeletedFalse(parent);
            System.out.println("Found " + children.size() + " children for parent " + parent.getName());

            return children;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public Child getChildById(Long id) {
        // Only return if not deleted
        return childRepository.findByIdAndIsDeletedFalse(id).orElse(null);
    }

    public List<Child> getAllChildren() {
        // Only return non-deleted children
        return childRepository.findByIsDeletedFalse();
    }

    public long getTotalChildrenCount() {
        return childRepository.countTotalChildren();
    }

    @Transactional
    public Child updateChild(Long id, Child childDetails) {
        Child child = childRepository.findByIdAndIsDeletedFalse(id).orElse(null);
        if (child != null) {
            child.setName(childDetails.getName());
            child.setDob(childDetails.getDob());
            child.setGender(childDetails.getGender());
            child.setBloodGroup(childDetails.getBloodGroup());
            child.setBirthWeight(childDetails.getBirthWeight());
            return childRepository.save(child);
        }
        return null;
    }

    @Transactional
    public boolean softDeleteChild(Long id) {
        try {
            Child child = childRepository.findById(id).orElse(null);
            if (child != null && child.getIsDeleted() == 0) {
                child.setIsDeleted(1); // Set to 1 for deleted
                child.setDeletedAt(LocalDateTime.now());
                childRepository.save(child);

                // Soft delete all associated schedules
                List<VaccinationSchedule> schedules = vaccineScheduleRepository.findByChildId(id);
                for (VaccinationSchedule schedule : schedules) {
                    schedule.setIsDeleted(1);
                    schedule.setDeletedAt(LocalDateTime.now());
                    vaccineScheduleRepository.save(schedule);
                }

                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public boolean restoreChild(Long id) {
        try {
            Child child = childRepository.findById(id).orElse(null);
            if (child != null && child.getIsDeleted() == 1) {
                child.setIsDeleted(0); // Set to 0 for active
                child.setDeletedAt(null);
                childRepository.save(child);

                // Restore all associated schedules
                List<VaccinationSchedule> schedules = vaccineScheduleRepository.findByChildId(id);
                for (VaccinationSchedule schedule : schedules) {
                    schedule.setIsDeleted(0);
                    schedule.setDeletedAt(null);
                    vaccineScheduleRepository.save(schedule);
                }

                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}