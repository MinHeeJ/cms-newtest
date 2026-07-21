package com.cms;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

final class JsonPathReader {
  private JsonPathReader() {}
  static String read(String json, String key) {
    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"" + key + "\"\s*:\s*\"([^\"]+)\"").matcher(json);
    if (!m.find()) throw new IllegalStateException("Missing " + key + " in " + json);
    return m.group(1);
  }
  static String seedPublishedDocument(MockMvc mvc) throws Exception {
    String folder = mvc.perform(post("/api/admin/folders")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"첨부 폴더\",\"active\":true}"))
      .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
    String folderId = read(folder, "folderId");
    String doc = mvc.perform(post("/api/admin/documents")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"folderId\":\"" + folderId + "\",\"title\":\"첨부 문서\",\"markdownBody\":\"본문\"}"))
      .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
    String documentId = read(doc, "documentId");
    mvc.perform(post("/api/admin/documents/" + documentId + "/publish")
        .contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(status().isOk());
    return documentId;
  }
}
