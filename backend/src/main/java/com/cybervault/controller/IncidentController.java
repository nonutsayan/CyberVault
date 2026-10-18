package com.cybervault.controller;

import com.cybervault.model.Incident;
import com.cybervault.repository.IncidentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://cybervault-uw5t.onrender.com"
})
public class IncidentController {
    private final IncidentRepository repository;

    public IncidentController(IncidentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@Valid @RequestBody Incident incident) {
        incident.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(incident));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incident> updateIncident(@PathVariable Long id,
                                                    @Valid @RequestBody Incident incoming) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setDescription(incoming.getDescription());
            existing.setSeverity(incoming.getSeverity());
            existing.setStatus(incoming.getStatus());
            existing.setSourceIp(incoming.getSourceIp());
            return ResponseEntity.ok(repository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
