package com.FTTTApp.Auth_Service.client;

import com.FTTTApp.Auth_Service.dto.ProfileSyncRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@FeignClient(name = "SERVICE-PROFILE", url = "${feign.profile-service.url:}")
public interface ProfileServiceClient {

    @PostMapping("/api/profiles/sync")
    void syncProfile(@RequestBody ProfileSyncRequest request);
}
