"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">API Docs</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Swagger/OpenAPI reference for storefront and manager inventory APIs.
      </p>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <SwaggerUI url="/api/openapi" docExpansion="list" persistAuthorization />
      </div>
    </div>
  );
}
