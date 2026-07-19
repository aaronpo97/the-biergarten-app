#ifndef BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_H_

/**
 * @file biergarten_pipeline.h
 * @brief Master umbrella header — includes every public header in the
 * Biergarten pipeline.
 */

// --- orchestrator ---
#include "biergarten_pipeline_orchestrator.h"

// --- concurrency ---
#include "concurrency/bounded_channel.h"

// --- data_generation ---
#include "data_generation/data_generator.h"
#include "data_generation/json_grammars.h"
#ifndef BIERGARTEN_MOCK_ONLY
#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"
#endif
#include "data_generation/mock_generator.h"
#include "data_generation/prompt_formatting/gemma4_jinja_prompt_formatter.h"
#include "data_generation/prompt_formatting/prompt_formatter.h"

// --- data_model ---
#include "data_model/generated_models.h"
#include "data_model/models.h"

// --- json_handling ---
#include "json_handling/pretty_print.h"
#include "services/curated_data/curated_json_data_service.h"

// --- llama backend ---
#ifndef BIERGARTEN_MOCK_ONLY
#include "llama_backend_state.h"
#endif

// --- services: curated_data ---
#include "services/curated_data/curated_data_service.h"
#include "services/curated_data/mock_curated_data_service.h"

// --- services: database ---
#include "services/database/export_service.h"
#include "services/database/sqlite_connection_helpers.h"
#include "services/database/sqlite_export_service.h"
#include "services/database/sqlite_export_service_helpers.h"
#include "services/database/sqlite_handle_types.h"
#include "services/database/sqlite_statement_helpers.h"

// --- services: datetime ---
#include "services/datetime/date_time_provider.h"
#include "services/datetime/timer.h"

// --- services: enrichment ---
#include "services/enrichment/enrichment_service.h"
#include "services/enrichment/mock_enrichment.h"
#include "services/enrichment/wikipedia_service.h"

// --- services: postal_code ---
#include "services/postal_code/mock_postal_code_service.h"
#include "services/postal_code/postal_code_service.h"
#include "services/postal_code/xeger_postal_code_service.h"
#include "services/xeger/xeger.h"

// --- services: logging ---
#include "services/logging/log_dispatcher.h"
#include "services/logging/log_entry.h"
#include "services/logging/log_producer.h"
#include "services/logging/logger.h"

// --- services: prompting ---
#include "services/prompting/prompt_directory.h"

// --- web_client ---
#include "web_client/http_web_client.h"
#include "web_client/web_client.h"

#endif  // BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_H_
